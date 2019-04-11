const ManufacturingGoal = require('../model/manufacturing_goal_model');
const pagination = require('./paginate');
const moment = require('moment-timezone');

module.exports.filter = async function(pageNum, sortBy, page_size, get_enabled){
    let pipeline = [];

    pipeline.push({
        $lookup: {
            from: 'skus',
            localField: 'sku_tuples.sku',
            foreignField: '_id',
            as: 'skus'
        }
    },
    {
        $lookup: {
            from: 'manufacturinglines',
            localField: 'skus.manufacturing_lines',
            foreignField: '_id',
            as: 'manufacturing_lines'
        }
    })

    if(get_enabled){
        pipeline.push({
            $match: {enabled: true}
        })
    }

    let agg = ManufacturingGoal.aggregate(pipeline);

    let result = await pagination.paginate(agg, pageNum, sortBy, page_size);

    populateSKUs(result);
    return result;
}

function populateSKUs(results){
    //fuckin garbage
    for(let item of results.data){
        for(let sku of item.skus){
            let manufacturing_lines = [];
            
            for(let line of item.manufacturing_lines){
                for(let id of sku.manufacturing_lines){
                    if(line._id.equals(id)){
                        manufacturing_lines.push(line.shortname)
                    }
                }
            }
            sku.manufacturing_lines = manufacturing_lines

            for(let tuple of item.sku_tuples){
                if(sku._id.equals(tuple.sku)){
                    tuple.sku = sku;
                }
            }
        }

        delete item.skus;
        delete item.manufacturing_lines;
        item.last_edit = moment.utc(item.last_edit).format('LLL')
    }
}