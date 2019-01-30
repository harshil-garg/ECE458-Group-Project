function create(name, number, package_size, cost) {
    if (!name || !package_size || !cost) {
        return get_error_response();
    }

    // if (isNotNumeric(cost)) {
    //     return get_error_response();
    // }

    // if (number) {
    //     if (isNotNumeric(number) || number % 1 != 0) {
    //         return get_error_response();
    //     }
    // }

    return get_success_response();
}

function update(number, cost) {
    if (number) {
        if (isNotNumeric(number) || number % 1 != 0) {
            return get_error_response();
        }
    }

    if (cost) {
        if (isNotNumeric(cost)) {
            return get_error_response();
        }
    }

    return get_success_response();
}

function isNotNumeric(value) {
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
    create: create,
    update: update
}