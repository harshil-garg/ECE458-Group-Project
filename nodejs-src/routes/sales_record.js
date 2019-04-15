// Core dependencies
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');

// Request libraries
const CronJob = require('cron').CronJob;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Schemas and models
const SKU = require('../model/sku_model');
const ProductLine = require('../model/product_line_model');
const SalesRecord = require('../model/sales_record_model');
const ManufacturingSchedule = require('../model/manufacturing_schedule_model');
const Formula = require('../model/formula_model');
const Ingredient = require('../model/ingredient_model');

// Utilities
const Queue = require('../utils/queue');
const LRUCache = require('../utils/cache');
const Time = require('../utils/time');
const Unit = require('../controllers/units');

// Variables (explained more in depth in functions)
var queue = new Queue();
var cache = new LRUCache(1000);

/****************************************************************************************************
 * ROUTES / APIs
 ****************************************************************************************************/

/**
 * API to serve the main view of the SalesRecord(s) page in the UI. The main view in the UI has been
 * designed to simply display product lines as headers in expandable cards. Upon clicking the card,
 * a list of all the SKUs in that product line are displayed. Each SKU in the list also has 2 action
 * buttons associated with it -- one for the summary view, and another for the drilldown view.
 *  
 * Therefore, all this route does is expect a list of product lines, and sends back all the SKUs
 * present across the product lines, grouped by product line.
 * 
 * @param {JSON} req Request from client for list of product lines
 * @param {JSON} res Response to send, SKUs grouped by product line
 */
router.post('/main', async function(req, res) {
    const { product_lines } = req.body;
    let data = {};
    for (let product_line_name of product_lines) {
        let product_line = await ProductLine.findOne({
            name: product_line_name
        });
        let skus = await SKU.find({
            product_line: product_line._id
        });
        data[product_line_name] = skus;
    }
    res.send(data);
});

 /**
  * API to serve the summary view that returns a JSON object. The JSON object returned will have
  * fields corresponding to each of the product lines requested. There will be an array associated
  * with each product line with each entry corresponding to a SKU in that product line. For each
  * SKU, information about the SKU (name, number, manufacturing rate, etc), yearly summary data of
  * all SalesRecord(s) for the SKU (revenue in 2017, sales in 2014, etc), and a ten-year-summary of
  * certain metrics will be returned.
  *
  * Product lines and customers must be provided, since we only want information on a select set of
  * product lines and SalesRecord(s) filtered by a group of customers. For each product line, we will 
  * calculate all the aforementioned statistics and metrics. Thus, we find all SKUs in the product
  * line, and for each SKU we add its info, get the SalesRecords for the last 10 years, filter by 
  * customer names, map the relevant information out of the SalesRecord(s), and push the yearly data 
  * into an array. If the data for a given year is not available, we do not do any metric analysis at
  * all, even if other years do exist. We simply queue the records to be retrieved from Prof. Bletsch's
  * server and gracefully add a message stating that the records for the SKU are not available yet and
  * move on to the next SKU. If all ten years of records are available, we do the basic calculations and
  * then continue with the ten-year-summary report. We add the information for the SKU and move on to
  * the next SKU in the product line. Once all SKUs in all product lines are processed, we return the
  * JSON object.
  *
  * @param {JSON} req Request from client to give summary of a specific SKU, filtered by customers
  * @param {JSON} res Response to send, all data
  * 
  * @since Evolution 3, Requirement 5.3.3
  */
 router.post('/summary_performance', async function(req, res) {
    const { sku_number, customers } = req.body;

    let sku = await SKU.findOne({
        number: sku_number
    });

    var sku_summary_data = {
        sku: sku
    };
    var sku_yearly_data = [];
    let start = new Date().getFullYear() - 9; let end = new Date().getFullYear();

    for (year = start; year <= end; year++) {
        let response = await getSalesRecords(sku.number, year);
        if (response.success) {
            console.log(response.source);
            const filteredRecords = response.data.filter(record => (
                customers.includes(record.customer_name)
            ));
            const mappedRecords = filteredRecords.map(record => (
                {
                    sales: record.sales,
                    price: record.price,
                    revenue: record.sales*record.price
                }
            ));
            sku_yearly_data.push(getYearlySummaryData(mappedRecords));
        }
    }
    sku_summary_data["sku_yearly_data"] = sku_yearly_data;

    if (sku_yearly_data.length < 10) {
        sku_summary_data["success"] = false;
        sku_summary_data["sku_ten_year_data"] = {};
    } else {
        let tenYearData = await getTotalSummaryData(sku, sku_yearly_data, new Date(start, 0, 1).toISOString());
        sku_summary_data["sku_ten_year_data"] = tenYearData;
        sku_summary_data["success"] = true;
    }

    res.send(sku_summary_data);

 });
 
 /**
  * API to serve the summary view that returns a JSON object. The JSON object returned will have
  * fields corresponding to each of the product lines requested. There will be an array associated
  * with each product line with each entry corresponding to a SKU in that product line. For each
  * SKU, information about the SKU (name, number, manufacturing rate, etc), yearly summary data of
  * all SalesRecord(s) for the SKU (revenue in 2017, sales in 2014, etc), and a ten-year-summary of
  * certain metrics will be returned.
  *
  * Product lines and customers must be provided, since we only want information on a select set of
  * product lines and SalesRecord(s) filtered by a group of customers. For each product line, we
  * will calculate all the aforementioned statistics and metrics. Thus, we find all SKUs in the
  * product line, and for each SKU we add its info, get the SalesRecords for the last 10 years,
  * filter by customer names, map the relevant information out of the SalesRecord(s), and push the
  * yearly data into an array. If the data for a given year is not available, we do not do any
  * metric analysis at all, even if other years do exist. We simply queue the records to be
  * retrieved from Prof. Bletsch's server and gracefully add a message stating that the records for
  * the SKU are not available yet and move on to the next SKU. If all ten years of records are
  * available, we do the basic calculations and then continue with the ten-year-summary report. We
  * add the information for the SKU and move on to the next SKU in the product line. Once all SKUs
  * in all product lines are processed, we return the JSON object.
  *
  * @param {JSON} req Request from client, filter by product lines and customers
  * @param {JSON} res Response to send, all data
  * 
  * @since Evolution 3, Requirement 5.3.3
  * @deprecated for performance reasons in favor of @method summary_performance
  */
router.post('/summary', async function(req, res) {
    const { product_lines, customers } = req.body;
    
    var data = {};
    for (let product_line_name of product_lines) {
        let product_line = await ProductLine.findOne({
            name: product_line_name
        });
        let skus = await SKU.find({
            product_line: product_line._id
        });

        var product_line_data = [];

        var product_line_summary_data = {};
        var valid_summary_data = true;
        for (let sku of skus) {
            var sku_summary_data = {
                sku_info: sku
            };

            var sku_yearly_data = [];
            let start = new Date().getFullYear() - 9; let end = new Date().getFullYear();
            for (year = start; year <= end; year++) {
                let response = await getSalesRecords(sku.number, year);
                if (response.success) {
                    console.log(response.source);
                    const filteredRecords = response.data.filter(record => (
                        customers.includes(record.customer_name)
                    ));
                    const mappedRecords = filteredRecords.map(record => (
                        {
                            sales: record.sales,
                            price: record.price,
                            revenue: record.sales*record.price
                        }
                    ));
                    let year_summary_data = getYearlySummaryData(mappedRecords);
                    sku_yearly_data.push(year_summary_data);

                    if (!product_line_summary_data.hasOwnProperty(year)) {
                        product_line_summary_data[year] = 0;
                        product_line_summary_data[year] += year_summary_data.revenue;
                    }
                    product_line_summary_data[year] += year_summary_data.revenue;
                }
            }
            sku_summary_data["sku_yearly_data"] = sku_yearly_data;

            if (sku_yearly_data.length < 10) {
                valid_summary_data = false;
                sku_summary_data["success"] = false;
                sku_summary_data["sku_ten_year_data"] = {};
                product_line_data.push(sku_summary_data);
                continue;
            }
            
            let tenYearData = await getTotalSummaryData(sku, sku_yearly_data, new Date(start, 0, 1).toISOString());
            sku_summary_data["sku_ten_year_data"] = tenYearData;
            sku_summary_data["success"] = true;
            product_line_data.push(sku_summary_data);
        }

        if (valid_summary_data) {
            let total = 0;
            for (let key of Object.keys(product_line_summary_data)) {
                total += product_line_summary_data[key];
            }
            product_line_summary_data["total"] = total;
        } else {
            product_line_summary_data = {};
        }

        data[product_line_name] = {
            summary: product_line_summary_data,
            data: product_line_data
        };
    }
    res.send(data);
});

router.post('/sales_projection_tool', async function(req, res) {
    const { sku_number, start, end } = req.body;

    let sku = await SKU.findOne({
        number: sku_number
    });
    
    let a = new Date(start);
    let b = new Date(end);
    while (b >= Date.now()) {
        a.setFullYear(a.getFullYear() - 1);
        b.setFullYear(b.getFullYear() - 1);
    }

    var data = {};
    data["sku"] = sku;

    var sku_yearly_data = [];
    var data_available = true;
    for (i = 0; i <= 3; i++) {
        let s = new Date(a.getTime()); s.setFullYear(s.getFullYear() - i);
        let e = new Date(b.getTime()); e.setFullYear(e.getFullYear() - i);

        var records = [];
        for (j = s.getFullYear(); j <= e.getFullYear(); j++) {
            let response = await getSalesRecords(sku_number, j);
            if (response.success) {
                console.log(response.source);
                const filteredRecords = response.data.filter(record => (
                    new Date(record.date) >= s &&
                    new Date(record.date) <= e
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

        if (data_available) {
            sku_yearly_data.push({
                start: moment.utc(s).format('LL'),
                end: moment.utc(e).format('LL'),
                sales: getTotalSales(records)
            });
        }
    }

    if (!data_available) {
        res.send({
            success: false,
            message: "Data is not fully available yet"
        });
        return;
    }


    data["success"] = true;
    data["sku_yearly_data"] = sku_yearly_data;
    data["summary"] = {
        average: Math.round(getAverageSales(sku_yearly_data)),
        standard_deviation: Math.round(10 * getStandardDeviation(sku_yearly_data)) / 10
    }

    res.send(data);

});

/**
 * API to serve the drilldown view that returns a JSON object. The JSON object will have information about the SKU,
 * a success indicator (true / false), a list of all the SalesRecord(s) in the given time frame, and a set of certain summary
 * metrics for all the records (total revenue, manufacturing run size, profit margin, etc).
 * 
 * The API requires the SKU number, a list of customers to filter by, and start & end dates. The SKU is first retrieved from
 * the database. For each full year that is part of the given timeframe, SalesRecord(s) are sent for. If SalesRecord(s) do not exist,
 * we return an error message and the API finishes. If records do exist, they are filtered and mapped into a well-defined schema.
 * Then, the advanced metric suite is applied, and the finished JSON object is sent back.
 * 
 *  @param {JSON} req Request from client, includes SKU number, filter by customers, start, and end date
  * @param {JSON} res Response to send, all data
  * 
  * @since Evolution 3, Requirement 5.3.4
 */
router.post('/drilldown', async function(req, res) {
    const { sku_number, customers, start, end } = req.body;
    
    let sku = await SKU.findOne({
        number: sku_number
    });

    var drilldown_data = {};
    drilldown_data["sku"] = sku;

    var data_available = true;
    var records = [];
    for (i = new Date(start).getFullYear(); i <= new Date(end).getFullYear(); i++) {
        let response = await getSalesRecords(sku_number, i);
        if (response.success) {
            console.log(response.source);
            const filteredRecords = response.data.filter(record => (
                customers.includes(record.customer_name) &&
                new Date(record.date) >= new Date(start) &&
                new Date(record.date) <= new Date(end)
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

    if (!data_available) {
        res.send({
            success: false,
            message: "Data is not fully available yet"
        });
        return;
    }

    drilldown_data["success"] = true;
    drilldown_data["records"] = records;
    drilldown_data["summary"] = await getTotalSummaryData(sku, records, start);

    res.send(drilldown_data);

});

/**
 * API to flush the cache and delete the entire SalesRecord database to trigger re-retrieval from
 * Prof. Bletsch's server upon next request of any SalesRecord related information.
 *
 * @since Evolution 3, 7.1.4
 */
router.post("/flush", async function(req, res) {
    cache.flushCache();
    try {
        let result = await SalesRecord.deleteMany({});
    } catch (error) {
        res.send(`MongoDB had an error in flushing out all the SalesRecord(s): ${error}`);
    }
    res.send("Cache and database successfully flushed");
});

/****************************************************************************************************
 * SUMMARY STATS / REVENUES / COSTS / PROFITS
 ****************************************************************************************************/

/**
 * Function called by the summary view which passes in a set of SalesRecord(s) for a given year and
 * wants basic summary information such as revenue, sales, and revenue per case. Much more basic
 * version of {@link getTotalSummaryData}.
 *
 * @param {array} records Array of SalesRecord(s) for the year
 * @since Evolution 3, Requirement 5.3.3.2
 */
function getYearlySummaryData(records) {
    return {
        revenue: getTotalRevenue(records),
        sales: getTotalSales(records),
        revenue_per_case: getTotalRevenue(records) / Math.max(1, getTotalSales(records))
    }
}

/**
 * Function responsible for taking an array of SalesRecord(s) are calculating total revenue, total
 * costs, and total profit when viewing all the records together, to create an inclusive sales
 * summary statement. The SKU and start date are also required for some of the heuristics and
 * number-crunching. The total revenue and total sales are computed, and then divided in order to
 * get the revenue per case. Then, the total cost of producing a single case of the SKU is
 * calculated by summing three costs: a fixed manufacturing cost per case, ingredient cost per case,
 * and the manufacturing line setup cost per case. While the first two costs are relatively straight
 * forward and can be computed precisely, the manufacturing line setup cost must be amortized over
 * how many cases of the SKU a single run can produce, since the cost is only incurred for each run.
 * To estimate how many cases are produced in a single run, a few estimations are employed (more
 * detail in helper functions and project requirements). Finally, the total cost per case is
 * subtracted from the revenue per case to determine the profit per case. All the information is
 * pushed into a JSON object and returned for consumption by the two primary views for SalesRecords.
 * It should be noted that both may use this same method because they will simply pass in different
 * sets of SalesRecords.
 *
 * @param {reference} sku SKU object from MongoDB database
 * @param {array} records Array of SalesRecord(s)
 * @param {string} start String representation of start date to restrict manufacturing activities to
 *
 * @since Evolution 3, Requirement 5.3.3.3 and 5.3.4.4
 */
async function getTotalSummaryData(sku, records, start) {
    let total_revenue = getTotalRevenue(records);
    let total_sales = getTotalSales(records);
    let revenue_per_case = total_revenue / (Math.max(1, total_sales))

    let manufacturing_run_size = await getManufacturingRunSize(sku, start);
    let manufacturing_setup_cost_per_case = sku.setup_cost / manufacturing_run_size;
    let manufacturing_run_cost_per_case = sku.run_cost;
    let ingredient_cost_per_case = await getIngredientCostPerCase(sku);
    let cogs_per_case = manufacturing_setup_cost_per_case + manufacturing_run_cost_per_case + ingredient_cost_per_case;

    let profit_per_case = revenue_per_case - cogs_per_case;
    let profit_margin = (revenue_per_case / cogs_per_case - 1) * 100;

    return {
        total_revenue: total_revenue,
        manufacturing_run_size: manufacturing_run_size,
        ingredient_cost_per_case: ingredient_cost_per_case,
        manufacturing_setup_cost_per_case: manufacturing_setup_cost_per_case,
        manufacturing_run_cost_per_case: manufacturing_run_cost_per_case,
        cogs_per_case: cogs_per_case,
        revenue_per_case: revenue_per_case,
        profit_per_case: profit_per_case,
        profit_margin: profit_margin
    }
}

/**
 * Calculates the total revenue, since each record contains a revenue field.
 *
 * @param {array} records Array of SalesRecord(s)
 * @since Evolution 3, Requirement 5.3.3.3 and 5.3.4.4
 */
function getTotalRevenue(records) {
    let revenue = 0;
    for (let record of records) {
        revenue += record.revenue;
    }
    return revenue;
}

/**
 * Calculates the total number of sales, since each record contains a sales field.
 *
 * @param {array} records Array of SalesRecord(s)
 * @since Evolution 3, Requirement 5.3.3.3 and 5.3.4.4
 */
function getTotalSales(records) {
    let sales = 0;
    for (let record of records) {
        sales += record.sales;
    }
    return sales;
}

/**
 * Finds the average manufacturing run size for a given SKU. Searches for all manufacturing
 * activities that were scheduled after the provided start date and finds the average duration (over
 * all activities). If no activities are found for the SKU, an average duration of 10 hours is
 * assumed. Based on the average duration, the run size is calculated by multiplying the
 * manufacturing rate with the duration to see how many cases of the SKU can be produced in a single
 * run.
 *
 * @param {reference} sku SKU object from MongoDB database
 * @param {string} start String representation of start date to restrict manufacturing activities to
 *
 * @since Evolution 3, Requirement 5.3.3.3 and 5.3.4.4
 */
async function getManufacturingRunSize(sku, start) {
    let activities = await ManufacturingSchedule.find({
        "activity.sku": sku._id,
        start_date: {
            "$gte": new Date(start)
        }
    }).exec();

    var avg_duration = 10;
    if (activities.length != 0) {
        var duration = 0;
        for (let activity of activities) {
            duration += activity.duration;
        }
        avg_duration = duration / activities.length;
    }

    return avg_duration * sku.manufacturing_rate;
}

/**
 * Given a particular SKU, this function calculates the ingredient cost of making one case of that
 * SKU. First, the Formula is extracted from the SKU. A Formula consists of ingredient-quantity
 * tuples, and so each tuple is analyzed separately to find the total ingredient cost. To get the
 * raw amount of the ingredient needed, the SKU's formula scale factor is multiplied by the quantity
 * of the ingredient and the unit conversion. Then, to find the number of packages, we divide by the
 * ingredient package size. Finally, we multiply by the cost of each package to get the cost for
 * that ingredient. Summing up the costs for all ingredients yields our total ingredient cost to
 * make a unit of the SKU.
 *
 * @param {reference} sku SKU object from MongoDB database
 */
async function getIngredientCostPerCase(sku) {
    let formula = await Formula.findOne({
        _id: sku.formula
    });

    let total = 0;
    let tuples = formula.ingredient_tuples;
    for (let tuple of tuples) {
        let ingredient = await Ingredient.findOne({
            _id: tuple.ingredient
        });
        let amount = sku.formula_scale_factor * tuple.quantity * Unit.convert(tuple.unit, ingredient.unit);
        let packages = amount / ingredient.package_size;
        let cost = packages * ingredient.cost;
        total += cost;
    }

    return total;
}

function getAverageSales(records) {
    return getTotalSales(records) / records.length;
}

function getStandardDeviation(records) {
    let xbar = getAverageSales(records);
    let sum = 0;
    for (let record of records) {
        sum += Math.pow(record.sales - xbar, 2);
    }
    return Math.sqrt(sum / records.length);
}

/****************************************************************************************************
 * GET SALES RECORDS
 ****************************************************************************************************/

/**
 * Helper method used by the two main routes to retrieve SalesRecord(s) given a SKU number and year.
 * Using these two parameters, a query object is created, and then the system physical cache and
 * MongoDB database are queried sequentially for the pertinent SalesRecords(s). If neither data
 * stores has the relevant information, the query is added to a queue for consumption by another
 * thread that will send the request to Prof. Bletsch's server and retrieve the SalesRecords(s).
 * Since there is a nonzero amount of time required to send the request and process the response,
 * and our system must maintain asynchronous standards, the system gracefully reports that the data
 * is not available yet. Future requests will be able to return actual data since by then the data
 * would have been committed to the cache or database layers.
 *
 * @param {number} sku_number SKU unique number
 * @param {year} year Year that records are requested for
 *
 * @since Evolution 3, Requirement 7.1.3 (gracefully handle state where record retrieval is queued
 * but not yet complete)
 */
async function getSalesRecords(sku_number, year) {
    let query = {
        sku_number: sku_number,
        year: year,
        str: `sku=${sku_number}&year=${year}`
    };

    let cacheResult = await queryCache(query);
    if (cacheResult.hit) {
        return {
            source: "cache",
            data: cacheResult.data,
            success: true
        }
    }
    
    let dbResult = await queryDB(query);
    if (dbResult.hit) {
        return {
            source: "db",
            data: dbResult.data,
            success: true
        }
    }
    
    queue.enqueue(query);
    return {
        source: "server",
        data: null,
        success: false
    }
}

/**
 * Attempts to find the relevant information in the system physical cache before reporting failure
 * and redirecting the request to the database.
 *
 * @param {JSON} query Query object which encapuslates the SKU number and year
 */
async function queryCache(query) {
    var result = await cache.read(query.str);
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

/**
 * Function accountable for querying the database to check for SalesRecord(s) based on a given SKU
 * number and year. Given the SKU unique number, the SKU object is extracted from the database.
 * Using the SKU MongoDB-assigned ID, all relevant SalesRecord(s) are extracted, and a secondary
 * populate query is run which injects the SKU info into each SalesRecord so that there is not just
 * a reference ID, but that the data that maps to the reference ID is freely available with
 * additional MongoDB queries. If there are zero SalesRecord(s) found, this means that the data has
 * not been requested from the server yet, and that case is handled by the caller. The "hit" is
 * reported as false in that case. If SalesRecord(s) are found, the "hit" is reported as true, and
 * the records are sent back to the caller function.
 *
 * @param {JSON} query Query object which encapuslates the SKU number and year
 */
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

/**
 * Function that runs every 200ms that checks if requests are queued up and if so, is responsible
 * for constructing and sending XMLHttpRequest(s) to the Prof. Bletsch's server to retrieve the
 * SalesRecord(s). The queue contains the query JSON object which encodes the SKU number and year
 * that SalesRecord(s) are being requested for. Once the server responds, the raw HTML is forwarded
 * to the process function for screen-scraping. The reason the queueing system exists and requests
 * are handled every 200ms instead of as quickly as possible is so that Prof. Bletsch's server does
 * not succumb to overload and become unresponsive as a result of high traffic.
 *
 * @requires XMLHttpRequest
 * @since Evolution 3, Requirement 7.1.3
 */
setInterval(function() {
    let query = queue.dequeue();
    if (!query) {
        return;
    }
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
}, 200);

/**
 * The processing function is executed as a callback to the XMLHttpRequest made to Prof. Bletsch's
 * server, and is primarily responsible for processing the XMLHttpResponse (raw HTML) sent back. The
 * response is split into lines since each line maps to a unique sales record, and an array of
 * SalesRecord objects that conform to our MongoDB schema is created from the raw data. 
 * 
 * Even if the SalesRecord(s) already exist in the database, repulling them happens sometimes for 
 * various events including refresh of sales figures (in case of 2019 requests), or if the cache or 
 * database queries are too slow and an accidental repull happens. Therefore, we must clean the 
 * database and cache, and repull the data as to not have duplications in our records. Then, the 
 * SalesRecord(s) are inserted into the database, pulled back from the database, database, and copied 
 * into the cache. The data must be pulled from the database instead of directly being admitted to the 
 * cache because adding records into the database populates records with some additional fields, such 
 * as ID, and those might be relevant for the future. In any case, this method is responsible for
 * caching the retrieved SalesRecord(s) in two ways: database and physical cache. These two layers
 * prevent the same query (SKU / year) tuple from being executed on the server again (barring
 * refresh operations for SKU / 2019).
 *
 * @param {string} query Query object which encapuslates the SKU number and year
 * @param {string} xml_http_response Raw HTML returned in which SalesRecord(s) are embedded
 *
 * @since Evolution 3, Requirement 7.1.1
 */
async function process(query, xml_http_response) {
    let lines = xml_http_response.match(/[^\r\n]+/g);

    let sku = await SKU.findOne({
        number: query.sku_number
    });
    
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

    let error = await SalesRecord.deleteMany({
        sku: sku._id,
        date: {
            "$gte": new Date(query.year, 0, 1), 
            "$lte": new Date(query.year, 11, 31, 23, 59, 59, 999)
        }
    });
    cache.delete(query.str);

    var docs;
    try {
        docs = await SalesRecord.insertMany(records);
    } catch (error) {
        console.log(`Schema validation error so records could not be inserted. Failed with error ${error}`);
    }

    let data = await SalesRecord.find({
        sku: sku._id,
        date: {
            "$gte": new Date(query.year, 0, 1), 
            "$lte": new Date(query.year, 11, 31, 23, 59, 59, 999)
        }
    }).populate({
        path: "sku"
    }).exec();

    cache.write(query.str, data);

    console.log("Data successfully admitted to MongoDB and cache for " + query.str);
}

/****************************************************************************************************
 * REFRESH SALES RECORDS
 ****************************************************************************************************/

/**
 * The CronJob is based on a Linux utility which schedules a command or script on the server to run
 * automatically at a specified time. This particular job executes an operation which is responsible
 * for refreshing the sales records from the current year. The job is configured to start when the
 * backend Node server is started, and it runs immediately on initialization without waiting for the
 * Cron pattern to actually match. This is to ensure that on production deployment, records from the
 * current year are fetched and immediately available.
 *
 * @param {string} cronTime Cron pattern which determines when the job fires
 * @param {string} onTick Function to be executed when the Cron pattern matches
 * @param {string} onComplete Function to be executed when the Cron job finishes
 * @param {boolean} start Whether job starts automatically or if explicit job.start() call is needed
 * @param {string} timeZone Configures the time the job fires alongside the Cron pattern
 * @param {boolean} runOnInit Whether job will fire on job init or if the Cron pattern must match
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
    runOnInit: false
});

/**
 * The refresh function is scheduled and executed automatically by the Cron job mentioned above. The
 * method extracts the current year from the system datetime, launches a database query to find all
 * SKUs in the system, and then for each SKU, constructs a query JSON object which combines the
 * unique SKU number with the current year. These two parameters constitute a query, which upon
 * interpretation by the Sales Record server, map directly to a set of sales figures of the SKU in
 * the given year. The refresh method does not itself send requests to the server, but simply adds
 * the query to a pipeline (queue) to be processed by a a consumer thread which will send the actual
 * requests.
 */
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

module.exports = router;