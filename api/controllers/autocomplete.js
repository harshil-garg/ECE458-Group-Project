module.exports.nameOrNumber = async (model, input) => {
    let regex = new RegExp('^'+input, 'i');
    if(isNaN(input)){
        let results = await model.find({name: regex}).limit(10).collation({locale: 'en'}).sort('name').lean().exec();
        return results;
    }else{
        //tolower converts number to string, 1 means to include
        let results = [];
        let cursor = model.aggregate({$addFields: {num2str: {'$toLower' : '$number'}, name: 1, size: 1, count: 1}}).match({num2str: regex}).cursor({}).exec();
        await cursor.eachAsync((sku) => {
            results.push(sku);
        });

        return results;
    }
}



