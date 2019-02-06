module.exports.ingredients = (model, input, res) => {
    let regex = new RegExp('^'+input, 'i'); //only checks from beginning of string
    model.find({name: regex}, 'name').limit(10).collation({locale: 'en'}).sort('name').lean().exec((err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            res.json({
                success: true,
                data: results
            });
        }
    });
}

module.exports.skus = async (model, input, res) => {
    let regex = new RegExp('^'+input, 'i');
    if(isNaN(input)){
        model.find({name: regex}, 'name size count').limit(10).collation({locale: 'en'}).sort('name').lean().exec((err, results) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                res.json({
                    success: true,
                    data: results
                });
            }
        })
    }else{
        //tolower converts number to string, 1 means to include
        let skus = [];
        let cursor = model.aggregate({$project: {num2str: {'$toLower' : '$number'}, name: 1, size: 1, count: 1}}).match({num2str: regex}).cursor({}).exec();
        await cursor.eachAsync((sku) => {
            skus.push(sku);
        });

        res.json({
            success: true,
            data: skus
        });
    }
}

module.exports.productLines = (model, input, res) => {
    let regex = new RegExp('^'+input, 'i'); //only checks from beginning of string
    model.find({name: regex}, 'name').limit(10).collation({locale: 'en'}).sort('name').lean().exec((err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            res.json({
                success: true,
                data: results
            });
        }
    });
}


