module.exports.ingredients = (model, input, res) => {
    let regex = new RegExp('^'+input, 'i'); //only checks from beginning of string
    model.find({name: regex}, 'name').limit(10).sort('name').lean().exec((err, results) => {
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

module.exports.skus = (model, input, res) => {
    let regex;
    if(isNaN(input)){
        regex = new RegExp('^'+input, 'i');
        model.find({name: regex}, 'name size count').limit(10).sort('name').lean().exec((err, results) => {
            res.json({
                success: true,
                data: results
            });
        })
    }else{
        res.json('he')
    }
}

module.exports.productLines = (model, input, res) => {
    let regex = new RegExp('^'+input, 'i'); //only checks from beginning of string
    model.find({name: regex}, 'name').limit(10).sort('name').lean().exec((err, results) => {
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


