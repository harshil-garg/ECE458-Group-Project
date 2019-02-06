const appender = require('./append_skus');

let limit = 10;

module.exports.paginate = async function (filter, model, pageNum, sortBy){
    let newFilter
    if(pageNum == -1){
        newFilter = filter.collation({locale: 'en'}).sort(sortBy).lean();
    }else{
        newFilter = filter.skip((pageNum-1)*limit).collation({locale: 'en'}).sort(sortBy).lean();
    }

    let results = await newFilter.exec();
    
    let pages = Math.ceil(results.length/limit) + (pageNum-1);
    let slice = (pageNum == -1) ? results.length : Math.min(limit, results.length);

    if(model.modelName === 'Ingredient'){
        let data = results.slice(0, slice);
        for(let ingredient of data){
            ingredient.cost = ingredient.cost.toFixed(2);
        }
        
        let final_data = await appender.append(data);
        return {
            success: true,
            data: final_data,
            pages: pages
        }
    }else{
        return {
            success: true,
            data: results.slice(0, slice),
            pages: pages
        }
    } 
    // newFilter.exec(async (err, results) => {
    //     if(err){
    //         res.json({success: false, message: err});
    //     }else{
    //         let pages = Math.ceil(results.length/limit) + (pageNum-1);
    //         let slice = Math.min(limit, results.length);

    //         if(model.modelName === 'Ingredient'){
    //             let data = results.slice(0, slice);
    //             for(let ingredient of data){
    //                 ingredient.cost = ingredient.cost.toFixed(2);
    //             }
    //             // appender.append(data, pages, res);
    //             res.json({
    //                 success: true,
    //                 data: results.slice(0, slice),
    //                 pages: pages
    //             });
    //         }else{
    //             res.json({
    //                 success: true,
    //                 data: results.slice(0, slice),
    //                 pages: pages
    //             });
    //         }           
    //     }       
    // });   
    
}


