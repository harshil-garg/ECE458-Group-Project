const CronJob = require('cron').CronJob;
const SKU = require('../model/sku_model');
const ProductLine = require('../model/product_line_model');
const SalesRecord = require('../model/sales_record_model');
const ManufacturingSchedule = require('../model/manufacturing_schedule_model');
const Formula = require('../model/formula_model');
const Ingredient = require('../model/ingredient_model');
const express = require('express');
const router = express.Router();
const Queue = require('../utils/queue');
const LRUCache = require('../utils/cache');
const Time = require('../utils/time');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const unit = require('../controllers/units');

var queue = new Queue();
var cache = new LRUCache(10);

router.post('/summary', async function(req, res) {

    const { product_lines, customers } = req.body;
    
    // Do validation, if product lines or customers are unselected assume all
    var data = {};
    for (let product_line_name of product_lines) {
        let product_line = await ProductLine.findOne({
            name: product_line_name
        });
        let skus = await SKU.find({
            product_line: product_line._id
        });

        var product_line_summary_data = [];
        for (let sku_info of skus) {
            var sku_summary_data = {};
            
            // Push in information about SKU
            sku_summary_data["sku_info"] = sku_info;

            // Calculate and then push in yearly summary statistics if the information is retrievable (5.3.3.2)
            let end = new Date().getFullYear();
            let start = end - 10;
            var sku_yearly_data = [];
            var sku_yearly_data_available = true;
            for (i = start; i <= end; i++) {
                console.log(i);
                let response = await getSalesRecords(sku_info.number, i);
                if (response.success) {
                    sku_yearly_data.push(getYearlySummaryStats(response.data, customers));
                } else {
                    sku_yearly_data_available = false;
                    // Flush the sku yearly data
                    sku_yearly_data = [];
                }
            }
            sku_summary_data["sku_yearly_data"] = sku_yearly_data;

            if (!sku_yearly_data_available) {
                sku_summary_data["success"] = false;
                sku_summary_data["sku_ten_year_data"] = {};
            } else {
                // Do req 5.3.3.3
                sku_summary_data["success"] = true;
                sku_summary_data["sku_ten_year_data"] = calculations(sku_info, sku_yearly_data, new Date(start, 0, 1).toISOString());
            }
            product_line_summary_data.push(sku_summary_data);
        }
        data["product_line_name"] = product_line_summary_data;
    }
    
    res.send(data);
});

function getYearlySummaryStats(records, customers) {
    var revenue = 0;
    var cases = 0
    for (let record of records) {;
        if (customers.includes(record.customer_name)) {
            cases += record.sales;
            revenue += record.sales * record.price;
        }
    }
    let avg = (revenue / cases).toFixed(2);
    return {
        sales: cases,
        revenue: revenue,
        revenue_per_case: avg
    }
}

router.post('/drilldown', async function(req, res) {
    const { sku_number, customers, start, end } = req.body;

    var drilldown_data = {};
    let sku = await SKU.findOne({number: sku_number});
    drilldown_data["sku_info"] = sku;

    let start_date = new Date(start);
    let start_date_year = start_date.getFullYear();

    let end_date = new Date(end);
    let end_date_year = end_date.getFullYear();

    var data_available = true;
    var records = [];
    for (i = start_date_year; i <= end_date_year; i++) {
        let response = await getSalesRecords(sku_number, i);
        if (response.success) {
            console.log(response.source);
            const filteredRecords = response.data.filter(record => (
                customers.includes(record.customer_name) &&
                new Date(record.date) >= start_date &&
                new Date(record.date) <= end_date
            ));
            const mappedRecords = filteredRecords.map(record => (
                {
                    year: new Date(record.date).getFullYear(),
                    week: Time.getISOWeekFromDate(new Date(record.date)),
                    customer_number: record.customer_number,
                    customer_name: record.customer_name,
                    sales: record.sales,
                    price: record.price,
                    revenue: record.sales*record.price
                }
            ));
            records = records.concat(mappedRecords);
            console.log(records.length);
        } else {
            data_available = false;
        }
    }

    // If the data was unavailable for any SKU/year, we have signed off on server query and we send a response with failure
    if (!data_available) {
        res.send({
            success: false,
            message: "Data is not fully available yet"
        });
        return;
    }

    drilldown_data["records"] = records;

    // Do requirement 5.3.4.4 = summary stats (same as 5.3.3.3 on this timespan)
    drilldown_data["summary"] = await calculations(sku, records, start);
    drilldown_data["success"] = true;
    res.send(drilldown_data);

});

async function calculations(sku, records, start) {
    let activities = await ManufacturingSchedule.find({
        "activity.sku": sku._id,
        start_date: {
            "$gte": new Date(start)
        }
    }).exec();
    
    let total_revenue = getTotalRevenue(records);
    let total_sales = getTotalSales(records);
    let mfg_run_size = getAvgManufacturingRunSize(activities, sku);
    let mfg_runs = total_sales / mfg_run_size;
    let mfg_setup_cost_per_case = sku.setup_cost / mfg_run_size;
    let mfg_run_cost_per_case = sku.run_cost;
    let ingredient_cost_per_case = await getIngredientCostPerCase(sku);
    let revenue_per_case = total_revenue / total_sales;
    let cogs_per_case = mfg_setup_cost_per_case + mfg_run_cost_per_case + ingredient_cost_per_case;
    let profit_per_case = revenue_per_case - cogs_per_case;
    let profit_margin = (revenue_per_case / cogs_per_case - 1) * 100;
    let ret = {
        total_revenue: total_revenue,
        mfg_run_size: mfg_run_size,
        ingredient_cost_per_case: ingredient_cost_per_case,
        mfg_setup_cost_per_case: mfg_setup_cost_per_case,
        mfg_run_cost_per_case: mfg_run_cost_per_case,
        cogs_per_case: cogs_per_case,
        revenue_per_case: revenue_per_case,
        profit_per_case: profit_per_case,
        profit_margin: profit_margin
    };
    console.log(ret);
    return ret;
}

function getTotalRevenue(records) {
    var revenue = 0;
    for (let record of records) {
        revenue += record.revenue;
    }
    console.log("Revenue is" + revenue);
    return revenue;
}

function getTotalSales(records) {
    var sales = 0;
    for (let record of records) {
        sales += record.sales;
    }
    return sales;
}

function getAvgManufacturingRunSize(activities, sku) {
    var avg_duration = 10;
    if (activities.length != 0) {
        // Find average manufacturing run size
        var duration = 0;
        for (let activity of activities) {
            duration += activity.duration;
        }
        avg_duration = duration / activities.length;
    }
    // The average manufacturing run size is the number of cases produced at one time
    return avg_duration * sku.manufacturing_rate;
}


async function getIngredientCostPerCase(sku) {
    let formula = await Formula.findOne({_id: sku.formula});
    var cost = 0;
    for (let tuple of formula.ingredient_tuples) {
        let ingredient = await Ingredient.findOne({_id: tuple.ingredient});
        let packages = sku.formula_scale_factor * tuple.quantity * unit.convert(tuple.unit, ingredient.unit) / ingredient.package_size;
        let ingredient_cost = packages * ingredient.cost;
        cost += ingredient_cost;
    }
    return cost;
}


async function getSalesRecords(sku_number, year) {
    let query = {
        sku_number: sku_number,
        year: year,
        str: `sku=${sku_number}&year=${year}`
    };

    // Check cache for data
    let cacheResult = await queryCache(query);
    if (cacheResult.hit) {
        return {
            source: "cache",
            data: cacheResult.data,
            success: true
        }
    }
    
    // Check database for data
    let dbResult = await queryDB(query);
    if (dbResult.hit) {
        return {
            source: "db",
            data: dbResult.data,
            success: true
        }
    }
    
    // Pull data from frontend screen-scraping
    queue.enqueue(query);
    return {
        source: "server",
        data: null,
        success: false
    }
}

async function queryCache(query) {
    var result = cache.read(String(query.str));
    if (result) {
        return {
            hit: true,
            data: result
        };
    }
    return {
        hit: false,
        data: null
    };
}

async function queryDB(query) {
    let sku = await SKU.findOne({
        number: query.sku_number
    });
    if (sku) {
        let sales_records = await SalesRecord.find({
            sku: sku._id,
            date: {
                "$gte": new Date(query.year, 0, 1), 
                "$lte": new Date(query.year, 11, 31, 23, 59, 59, 999)
            }
        }).populate({
            path: "sku"
        }).exec();

        // If sales records are found in the database, write to the cache and retun
        if (sales_records && sales_records.length > 0) {
            cache.write(query.str, sales_records);
            return {
                hit: true,
                data: sales_records
            }
        }
    }
    return {
        hit: false,
        data: null
    }
}

async function queryServer() {
    let query = queue.dequeue();
    if (!query) {
        return;
    }
    console.log("Processing " + query.str);
    let url = `http://hypomeals-sales.colab.duke.edu:8080/?${query.str}`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            let xml_http_response = xmlHttp.responseText;
            process(query, xml_http_response);
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

setInterval(queryServer, 200);

async function process(query, xml_http_response) {
    // Splits HTML by line
    let lines = xml_http_response.match(/[^\r\n]+/g);

    // Retrieves SKU from database
    let sku = await SKU.findOne({
        number: query.sku_number
    });
    
    // Screen scraping
    var records = [];
    for (let line of lines) {
        if (line.startsWith("<tr>")) {
            var row = line.split("<td>");
            var record = new SalesRecord({
                sku: sku._id,
                date: Time.getDate(row[1], row[3]),
                customer_number: row[4],
                customer_name: row[5],
                sales: row[6],
                price: row[7]
            })
            records.push(record);
        }
    }

    // Delete all SalesRecord(s) from the current year as to not have duplicates
    if (query.year >= new Date().getFullYear()) {
        let error = await SalesRecord.deleteMany({
            sku: sku._id,
            date: {
                "$gte": new Date(query.year, 0, 1), 
                "$lte": new Date(query.year, 11, 31, 23, 59, 59, 999)
            }
        });
    }

    // Insert the retrieved SalesRecord(s) into the database
    var docs;
    try {
        docs = await SalesRecord.insertMany(records);
    } catch (error) {
        console.log(`Schema validation error so records could not be inserted. Failed with error ${error}`);
    }

    // Retrieve data for write-back to cache
    let data = await SalesRecord.find({
        sku: sku._id,
        date: {
            "$gte": new Date(query.year, 0, 1), 
            "$lte": new Date(query.year, 11, 31, 23, 59, 59, 999)
        }
    }).populate({
        path: "sku"
    }).exec();

    // Write data to cache using the query string as the key
    cache.write(query.str, data);

    console.log("Data successfully admitted to MongoDB and cache");
}

// Refreshes the current year data (also pushes the updates to MongoDB / cache)
async function refresh() {
    let year = new Date().getFullYear();
    let skus = await SKU.find();
    if (skus && skus.length > 0) {
        for (let sku of skus) {
            let query = {
                sku_number: sku.number,
                year: year,
                str: `sku=${sku.number}&year=${year}`
            };
            queue.enqueue(query);
        }
    }
}

/**
 * The CronJob is based on a Linux utility which schedules a command or script
 * on the server to run automatically at a specified time 
 *
 * @param {string} cronTime
 * @param {string} onTick
 * @param {string} onComplete
 * @param {boolean} start
 * @param {string} timeZone
 * @param {string} runOnInit
 *
 * @requires CronJob
 * @since Evolution 3, Requirement 7.1.2
 */
var job = new CronJob({
    cronTime: '55 * * * *',
    onTick: refresh,
    onComplete: function() {
        console.log("Job complete.");
    },
    start: true,
    timeZone: 'America/New_York',
    runOnInit: true
});

router.post("/flush", async function(req, res) {
    cache.flushCache();
    try {
        let result = await SalesRecord.deleteMany({});
    } catch (error) {
        res.send(`MongoDB had an error in flushing out all the SalesRecord(s): ${error}`);
    }
    res.send("Cache and database successfully flushed");
});

module.exports = router;