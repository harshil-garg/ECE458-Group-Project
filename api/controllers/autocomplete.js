module.exports.autocomplete = (model, input, callback) => {
    let regex = new RegExp('^'+input, 'i'); //only checks from beginning of string
    model.find({name: regex}, 'name', {sort: 'name'}, (err, results) => {
        callback(err, results);
    });
}