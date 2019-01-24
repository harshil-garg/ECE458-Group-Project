function initialize() {
    // Setting URL and headers for request
    var options = {
        url: true
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
        // Do async job
        var d = 'truez';
        setTimeout(function() {
            if (d != 'truex') {
                reject("poo");
            } else {
                resolve("yay");
            }
        }, 3000)
    })

}

function main() {
    var initializePromise = initialize();
    initializePromise.then(function(result) {
        console.log(result);
    }, function(err) {
        console.log(err);
    })
}

main();
/*setTimeout(function() {
    console.log("hi");       
}, 3000);
console.log("pi");*/