const weight_set = new Set(['oz.', 'lb.', 'ton', 'g', 'kg']);
const volume_set = new Set(['fl. oz.', 'pt.', 'qt.', 'gal.', 'mL', 'L']);
const count_set = new Set(['count']);

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