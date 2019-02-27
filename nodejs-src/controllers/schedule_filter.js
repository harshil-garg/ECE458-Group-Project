const ManufacturingSchedule = require('../model/manufacturing_schedule_model')

module.exports.filter = async function(manufacturing_line, start, end){
    pipeline = [];
    pipeline.push({
        $lookup: {
            from: 'skus',
            localField: 'activity.sku',
            foreignField: '_id',
            as: 'activity.sku'
        }
    },
    {$unwind: '$activity.sku'},
    {
        $lookup: {
            from: 'manufacturinggoals',
            localField: 'activity.manufacturing_goal',
            foreignField: '_id',
            as: 'activity.manufacturing_goal'
        }
    },
    {$unwind: '$activity.manufacturing_goal'},
    {
        $lookup: {
            from: 'manufacturinglines',
            localField: 'manufacturing_line',
            foreignField: '_id',
            as: 'manufacturing_line'
        }
    },
    {$unwind: '$manufacturing_line'},
    {
        $lookup: {
            from: 'manufacturinglines',
            localField: 'activity.sku.manufacturing_lines',
            foreignField: '_id',
            as: 'activity.sku.manufacturing_lines'
        }
    });

    if(manufacturing_line && start && end){
        pipeline.push({$match: {'manufacturing_line.shortname': manufacturing_line}}//,
        // {$addFields: {end_date: {$add: ['$start_date', '$duration']}}},
        // {$match: {$or: [{start_date: {$lt: end}}, {end_date: {$gt: start}}]}}
        )
    }

    let cursor = ManufacturingSchedule.aggregate(pipeline).cursor({}).exec();
    
    let results = [];
    await cursor.eachAsync((res) => {
        results.push(res);
    });

    convertToShortnames(results)

    return results;
}


function convertToShortnames(results){
    
    for(let map of results){
        let shortnames = [];
        for(let line of map.activity.sku.manufacturing_lines){
            shortnames.push(line.shortname);
        }
        map.activity.sku.manufacturing_lines = shortnames;
    }
    
}
