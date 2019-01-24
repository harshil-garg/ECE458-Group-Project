function add(name, number, package_size, cost) {

    var json = get_error_response();
    console.log(name + " 1 " + number + " 2 " + package_size + " 3 " + cost);
    if (!name || !package_size || !cost) {
        return json;
    }

    console.log("why");
    if (isNumeric(cost)) {
        return json;
    }

    if (number) {
        if (isNumeric(number) || number % 1 != 0) {
            return json;
        }
    }

    return get_success_response();
}

function isNumeric(value) {
    return isNaN(value) || value.trim() == "" || value < 0;
}

function get_error_response() {
    return {
        success: false, 
        message: "Please fill in all the fields."
    };
}

function get_success_response() {
    return {
        success: true,
        message: "Validation passed."
    };
}

module.exports = {
    add: add
}