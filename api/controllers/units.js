const math = require('mathjs')
const weight_set = new Set(['oz.', 'lb.', 'ton', 'g', 'kg']);
const volume_set = new Set(['fl. oz.', 'pt.', 'qt.', 'gal.', 'mL', 'L']);
const count_set = new Set(['count']);

//create units to go with our syntax
math.createUnit('count');

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
    // Strip units of non alphanumeric characters
    unit_before = unit_before.replace(/\W/g, '');
    unit_after = unit_after.replace(/\W/g, '');

    let unit_obj = math.unit(unit_before);

    let result = unit_obj.toNumber(unit_after);


    return result;
}