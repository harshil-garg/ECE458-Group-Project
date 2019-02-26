module.exports.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

module.exports.zip = (a,b) => a.map((x,i) => [x,b[i]]);