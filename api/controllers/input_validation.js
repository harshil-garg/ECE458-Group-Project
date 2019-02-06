module.exports.passed = function(params, res){
    errors = []
    for(let key of Object.keys(params)){
        let alphanumeric = new RegExp(/^[a-zA-Z0-9 .]*$/);
        if(!params[key]){
            errors.push(`Please fill in ${key}`);
        }else if(!params[key].toString().match(alphanumeric)){
            errors.push(`${key} is not alphanumeric`);
        }
    }

    if(errors.length > 0){
        res.json({success: false, message: errors});
        return false;
    }else{
        return true;
    }
}