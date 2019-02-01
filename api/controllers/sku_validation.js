// Dependency checks
module.exports.itemExists = async function(model, itemName) {
    let ans = false;
    await model.findOne({name: itemName}).exec((err, result) => {       
        ans = !result;     
    })

    return ans;
}

const first_digit = new Set(['0', '1', '6', '7', '8', '9'])
// Syntax checks
module.exports.isUPCStandard = function(upc_num) {
    if(upc_num.length != 12){
        //incorrect length
        return false;
    }
    let num = Number(upc_num);
    if(isNaN(num)){
        //not a number
        return false;
    }

    if(!first_digit.has(upc_num[0])){
        //invalid first digit
        return false;
    }

    //checksum
    let sum = 0;
    for(let i = 0; i < upc_num.length; i++){
        if(i % 2 == 0){
            sum += 3*Number(upc_num[i]);
        }else{
            sum += Number(upc_num[i]);
        }
    }

    if(sum % 10 != 0){
        //invalid sum
        return false
    }

    return true;

}
