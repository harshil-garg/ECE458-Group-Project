const limit = 10;
module.exports.nameOrNumber = async (model, input) => {
    let regex = new RegExp('^'+input, 'i');
    if(isNaN(input)){
        let results = await model.find({name: regex}).limit(limit).collation({locale: 'en'}).sort('name').lean().exec();
        return results;
    }else{
        //tolower converts number to string, 1 means to include
        let results = [];
        let cursor = model.aggregate({$addFields: {num2str: {'$toLower' : '$number'}}}).match({num2str: regex}).limit(limit).cursor({}).exec();
        await cursor.eachAsync((sku) => {
            results.push(sku);
        });

        return results;
    }
}



