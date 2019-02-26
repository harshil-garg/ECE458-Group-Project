const first_digit = new Set(['0', '1', '6', '7', '8', '9']);

// Syntax checks
module.exports.isUPCStandard = function(upc_num) {
    let err_msg;
    if(upc_num.length != 12){
        //incorrect length
        err_msg = 'Invalid UPC length';
        return [false, err_msg];
    }
    let num = Number(upc_num);
    if(isNaN(num)){
        //not a number
        err_msg = 'UPC# must be a number ';
        return [false, err_msg];
    }

    if(!first_digit.has(upc_num[0])){
        //invalid first digit
        err_msg = 'Invalid UPC first digit';
        return [false, err_msg];
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
        err_msg = 'Invalid UPC sum';
        return [false, err_msg];
    }

    return [true, err_msg];

}
function generateUPCNumbers(){
    for(let i = 100000000000; i < 200000000000; i++){
        if(this.isUPCStandard(i.toString())[0]){
            console.log(i)
        }
    }
}