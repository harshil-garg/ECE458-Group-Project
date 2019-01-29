
module.exports.paginate = function (results, pageNum, limit, res){
    let pages = Math.ceil(results.length/limit) + (pageNum-1);
    let slice = Math.min(limit, results.length);
    res.json({success: true,
        data: results.slice(0,slice),
        pages: pages});
};