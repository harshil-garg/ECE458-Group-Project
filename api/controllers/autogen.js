module.exports.autogen = async function (model) {
    let items = await model.find().sort({number: 1}).collation({locale: "en_US", numericOrdering: true}).exec()
    return smallest_missing_number(items, 0, items.length - 1);
}

function smallest_missing_number(items, lo, hi) {
    if (lo > hi)
        return lo + 1;
    let mid =  Math.floor(lo + (hi - lo) / 2);

    if (items[mid].number == mid+1) {
        return smallest_missing_number(items, mid + 1, hi);
    } else {
        return smallest_missing_number(items, lo, mid - 1);
    }
}