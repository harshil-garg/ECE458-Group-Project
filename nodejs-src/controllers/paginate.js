const appender = require('./append_skus');

module.exports.paginate = async function (aggregate, pageNum, sortBy, limit){
    let pipeline = [];

    aggregate.sort(sortBy);
    aggregate.options = {collation: {locale: 'en'}}

    //don't skip if pagenum == -1
    if(pageNum != -1){
        pipeline.push({$skip: (pageNum-1)*limit});
    }
    aggregate.append(pipeline);

    let cursor = aggregate.cursor({}).exec();

    let results = [];
    await cursor.eachAsync((res) => {
        results.push(res);
    });
    console.log(results)

    let pages = Math.ceil(results.length/limit) + (pageNum-1);
    let slice = (pageNum == -1) ? results.length : Math.min(limit, results.length);


    return {
        success: true,
        data: results.slice(0, slice),
        pages: pages,
        total_docs: (pageNum == -1) ? results.length : results.length + (pageNum-1)*limit
    }

}
