module.exports.passed = function(params, res){
    errors = []
    for(let key of Object.keys(params)){
        if(!params[key]){
            errors.push(`Please fill in ${key}`);
        }
    }

    if(errors.length > 0){
        res.json({success: false, message: errors});
        return false;
    }else{
        return true;
    }
}