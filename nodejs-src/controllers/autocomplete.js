const limit = 10;
module.exports.nameOrNumber = async (model, input) => {
    let regex = new RegExp('^'+input, 'i');
    if(isNaN(input)){
        let results = await model.find({name: regex}).limit(limit).collation({locale: 'en'}).sort('name').lean().exec();
        return results;
    }else{
        //tolower converts number to string, 1 means to include
        let results = [];
        let cursor = await model.aggregate([{$addFields: {num2str: {'$toLower' : '$number'}}}]).match({num2str: regex}).limit(limit).cursor({}).exec();
        await cursor.eachAsync((sku) => {
            results.push(sku);
        });

        return results;
    }
}
// autocomplete for schedule
module.exports.nameOrEmail = async (model, goal, user) => {
    let regex_goal = new RegExp('^'+goal, 'i');
    let regex_user = new RegExp('^'+user, 'i');
    if(goal != '' && user != ''){
        return await model.find({name: regex_goal}, {user: regex_user}).limit(limit).collation({locale: 'en'}).sort('name').lean().exec();
    }else{
        return await model.find({$or: [{name: regex_goal}, {user: regex_user}]}).limit(limit).collation({locale: 'en'}).sort('name').lean().exec();
    }
}
//autocomplete for registration
module.exports.email = async (model, input) => {
    let regex = new RegExp('^'+input, 'i');
    return await model.find({email: regex}).limit(limit).collation({locale: 'en'}).sort('email').lean().exec();
}



