const ManufacturingSchedule = require('../model/manufacturing_schedule_model')
const User = require('../model/user_model');

module.exports.getUserModel = async function(user){
    let cursor = await User.aggregate([{$match: {email: user}}, {
        $lookup: {
            from: 'manufacturinglines',
            localField: 'plant_manager',
            foreignField: '_id',
            as: 'manufacturinglines'
        }
    }]).cursor({}).exec();
    
    let user_model;
    await cursor.eachAsync((res) => {
        user_model = res;
    });

    return user_model;
}

module.exports.filter = async function(user, manufacturing_line, start, end){
    pipeline = [];
    if(user){
        pipeline.push({
            $match: {$or: [{committed: true}, {$and: [{committed: false}, {user: user}]}]}
        })
    }else{
        pipeline.push({
            $match: {committed: true}
        })
    }
    pipeline.push(
    {
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
    }
    );

    if(manufacturing_line && start && end){
        pipeline.push({$match: {'manufacturing_line.shortname': manufacturing_line}},
        {$addFields: {hours_to_six: {$subtract: [22, {$hour: '$start_date'}]}}},
        {$addFields: {end_date: {$cond: {
            if: {$gte: ['$hours_to_six', '$duration']}, 
            then: {$add: ['$start_date', {$multiply: ['$duration', 60, 60, 1000]}]}, 
            else: {$add: ['$start_date', 
                    {$multiply: [24, 60, 60, 1000]}, 
                    {$multiply: [{$floor: {$divide: [{$subtract: ['$duration', '$hours_to_six']}, 10.01]}}, 24, 60, 60, 1000]},
                    {$multiply: [{$mod: [{$subtract: ['$duration', '$hours_to_six']}, 10]}, 60, 60, 1000]}
            ]}
        }}}},
        // {$addFields: {end_date: {$add: ['$start_date', {$multiply: ['$duration', 60, 60, 1000]}]}}},
        {$match: {$and: [{start_date: {$lte: new Date(end)}}, {end_date: {$gte: new Date(start)}}]}},
        {
            $lookup: {
                from: 'formulas',
                localField: 'activity.sku.formula',
                foreignField: '_id',
                as: 'activity.sku.formula'
            }
        },
        {$unwind: '$activity.sku.formula'},
        {
            $lookup: {
                from: 'ingredients',
                localField: 'activity.sku.formula.ingredient_tuples.ingredient',
                foreignField: '_id',
                as: 'ingredients'
            }
        }
        )
    }

    let cursor = ManufacturingSchedule.aggregate(pipeline).cursor({}).exec();
    
    let results = [];
    await cursor.eachAsync((res) => {
        results.push(res);
    });


    if(manufacturing_line && start && end){
        populateIngredients(results)
    }

    convertToShortnames(results)

    return results;
}


function populateIngredients(results){
    for(let map of results){        
        for(let ingredient of map.ingredients){
            for(let tuple of map.activity.sku.formula.ingredient_tuples){
                if(ingredient._id.equals(tuple.ingredient)){
                    tuple.ingredient = ingredient;
                }
            }
        }
        delete map.ingredientss
    }
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
