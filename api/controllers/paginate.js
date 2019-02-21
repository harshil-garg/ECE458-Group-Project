const appender = require('./append_skus');

const limit = 10;

module.exports.paginate = async function (aggregate, pageNum, sortBy){
    let pipeline = [];
    //don't skip if pagenum == -1
    if(pageNum != -1){
        pipeline.push({$skip: (pageNum-1)*limit});
    }

    aggregate.append(pipeline);
    aggregate.sort(sortBy)
    aggregate.options = {collation: {locale: 'en'}}

    let cursor = aggregate.cursor({}).exec();

    let results = [];
    await cursor.eachAsync((res) => {
        results.push(res);
    });
    
    let pages = Math.ceil(results.length/limit) + (pageNum-1);
    let slice = (pageNum == -1) ? results.length : Math.min(limit, results.length);


    return {
        success: true,
        data: results.slice(0, slice),
        pages: pages,
        total_docs: results.length
    }
    
}


