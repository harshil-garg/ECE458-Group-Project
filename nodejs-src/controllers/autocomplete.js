const limit = 10;
module.exports.nameOrNumber = async (model, input) => {
    let regex = new RegExp('^'+input, 'i');
    let results = [];
    let pipeline = [];
    let cursor;
    if(model.modelName == 'Formula'){
        pipeline.push({
            $lookup: {
                from: 'ingredients',
                localField: 'ingredient_tuples.ingredient',
                foreignField: '_id',
                as: 'ingredients'
            }
        })
    }
    if(isNaN(input)){
        cursor = await model.aggregate(pipeline).match({$or: [{name: regex}, {shortname: regex}]}).limit(limit).cursor({}).exec();
    }else{
        //tolower converts number to string, 1 means to include
        pipeline.push({$addFields: {num2str: {'$toLower' : '$number'}}});

        cursor = await model.aggregate(pipeline).match({num2str: regex}).limit(limit).cursor({}).exec();
    }
    await cursor.eachAsync((sku) => {
        results.push(sku);
    });

    populateIngredients(results);

    return results;
}
// autocomplete for schedule
module.exports.nameOrEmail = async (model, goal, user) => {
    let regex_goal = new RegExp('^'+goal, 'i');
    let regex_user = new RegExp('^'+user, 'i');
    if(goal != '' && user != ''){
        return await model.find({name: regex_goal, user: regex_user}).limit(limit).collation({locale: 'en'}).sort('name').lean().exec();
    }else if (goal != ''){
        return await model.find({name: regex_goal}).limit(limit).collation({locale: 'en'}).sort('name').lean().exec();
    }else{
        return await model.find({user: regex_user}).limit(limit).collation({locale: 'en'}).sort('name').lean().exec();
    }
}
//autocomplete for registration
module.exports.email = async (model, input) => {
    let regex = new RegExp('^'+input, 'i');
    return await model.find({email: regex}).limit(limit).collation({locale: 'en'}).sort('email').lean().exec();
}

function populateIngredients(results){
    for(let item of results){
        for(let ingredient of item.ingredients){
            for(let tuple of item.ingredient_tuples){
                if(ingredient._id.equals(tuple.ingredient)){
                    tuple.ingredient = ingredient.name;
                }
            }
        }
        delete item.ingredients;
    }
}
