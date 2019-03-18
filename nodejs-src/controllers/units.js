const math = require('mathjs')
const weight_set = new Set(['oz', 'ounce', 'lb', 'pound', 'ton', 'g', 'gram', 'kg', 'kilogram']);
const volume_set = new Set(['floz', 'fluidounce', 'pt', 'pint', 'qt', 'quart', 'gal', 'gallon', 'ml', 'milliliter', 'l', 'liter']);
const count_set = new Set(['ct', 'count']);

//create units to go with our syntax
math.createUnit('ct');
math.createUnit('count');

module.exports.validUnit = function(unit){
    return (weight_set.has(unit) || volume_set.has(unit) || count_set.has(unit));
}

module.exports.category = function(unit){
    if(weight_set.has(unit)){
        return 'weight';
    }else if(volume_set.has(unit)){
        return 'volume';
    }else if(count_set.has(unit)){
        return 'count';
    }else{
        return 'none';
    }
}

// Convert the value from unit before to unit after
module.exports.convert = function(unit_before, unit_after){
    if (unit_before == "pound")
        unit_before = "poundmass";
    if (unit_after == "pound")
        unit_after = "poundmass";
    // Strip units of non alphanumeric characters
    unit_before = unit_before.replace(/\W/g, '');
    unit_after = unit_after.replace(/\W/g, '');

    let unit_obj = math.unit(unit_before);

    let result = unit_obj.toNumber(unit_after);


    return result;
}