module.exports.valid_cost = function(cost){
    return cost >= 0;
}

module.exports.round_cost = function(cost){
    return (isNaN(cost)) ? cost : Number(cost).toFixed(2); //makes sure that toFixed is not called on strings
}