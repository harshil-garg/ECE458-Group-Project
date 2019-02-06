const express = require('express');
const router = express.Router();
const ingredient_filter = require('../controllers/ingredient_filter');
const sku_filter = require('../controllers/sku_filter');
const input_validator = require('../controllers/input_validation');
const pagination = require('../controllers/paginate');
const ProductLine = require('../model/product_line_model');

let pageNum = -1; //return all, don't paginate
router.post('/ingredients', async (req, res) => {
    const { sortBy, keywords, skus} = req.body;
    const required_params = { sortBy, keywords, skus };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    //No filter, return all
    if(keywords.length == 0 && skus.length == 0){
        let results = await ingredient_filter.none(pageNum, sortBy);
        format_ingredients(results.data);
        res.json(results);
    }
    //Keywords no SKUs
    else if(skus.length == 0){
        let results = await ingredient_filter.keywords(pageNum, sortBy, key_exps);
        format_ingredients(results.data);
        res.json(results);
    }
    //SKUs no keywords
    else if(keywords.length == 0){
        //get all ingredients with given SKUs
        let skuList = await SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name').exec();

        let results = await ingredient_filter.skus(pageNum, sortBy, skuList);
        format_ingredients(results.data);
        res.json(results);
    }
    //Keywords and SKUs
    else{
        let skuList = await SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name').exec();
        
        let results = await ingredient_filter.keywordsAndSkus(pageNum, sortBy, key_exps, skuList);
        format_ingredients(results.data);
        res.json(results);
    }
});

router.post('/skus', async (req, res) => {
    filter_skus(req, res, format_skus);
});

router.post('/product_lines', async (req, res) => {
    let filter = ProductLine.find({});
    let results = await pagination.paginate(filter, ProductLine, pageNum, 'name');
    format_product_lines(results.data);
    res.json(results);
});

router.post('/formulas', (req, res) => {
    filter_skus(req, res, format_formulas);
});


function format_ingredients(ingredients) {
    for(let ingredient of ingredients){
        ingredient['Ingr#'] = ingredient.number;
        delete ingredient.number;
        ingredient['Name'] = ingredient.name;
        delete ingredient.name;
        ingredient['Vendor Info'] = ingredient.vendor_info;
        delete ingredient.vendor_info;
        ingredient['Size'] = ingredient.package_size;
        delete ingredient.size;
        ingredient['Cost'] = ingredient.cost;
        delete ingredient.cost;
        ingredient["Comment"] = ingredient.comment;
        delete ingredient.comment;
        delete ingredient.skus;
        delete ingredient.num_skus;
    }
}

function format_skus(skus) {
    for(let sku of skus){
        sku['SKU#'] = sku.number;
        delete sku.number;
        sku['Name'] = sku.name;
        delete sku.name;
        sku['Case UPC'] = sku.case_upc;
        delete sku.case_upc;
        sku['Unit UPC'] = sku.unit_upc;
        delete sku.unit_upc;
        sku['Unit size'] = sku.size;
        delete sku.size;
        sku['Count per case'] = sku.count;
        delete sku.count;
        sku['Product Line Name'] = sku.product_line;
        delete sku.product_line;
        sku['Comment'] = sku.comment;
        delete sku.comment;
        delete sku.ingredients;
    }
}

function format_product_lines(product_lines) {
    for(let line of product_lines){
        line['Name'] = line.name;
        delete line.name;
    }
}

function format_formulas(skus){
    let formulas = [];
    for(let i = skus.length-1; i >= 0; i-- ){
        for(let formula of skus[i].ingredients){
            formulas.push({ 'SKU#': skus[i].number, 'Ingr#': formula.ingredient_number, Quantity: formula.quantity })
        }
        skus.splice(i, 1); //delete the sku after extracting the data

    }
    skus.push(...formulas);
}

async function filter_skus(req, res, format){
    const { sortBy, keywords, ingredients, product_lines } = req.body;
    const required_params = { sortBy, keywords, ingredients, product_lines };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });
    
    if(keywords.length == 0 && ingredients.length == 0 && product_lines.length == 0){
        let results = await sku_filter.none(pageNum, sortBy);
        format(results.data);
        res.json(results);
    }else if(ingredients.length == 0 && product_lines.length == 0){
        let results = await sku_filter.keywords(pageNum, sortBy, key_exps);
        format(results.data);
        res.json(results);
    }else if(keywords.length == 0 && product_lines.length == 0){
        let results = await sku_filter.ingredients(pageNum, sortBy, ingredients);
        format(results.data);
        res.json(results);
    }else if(keywords.length == 0 && ingredients.length == 0){
        let results = await sku_filter.productLines(pageNum, sortBy, product_lines);
        format(results.data);
        res.json(results);
    }else if(product_lines.length == 0){
        let results = await sku_filter.keywordsandIngredients(pageNum, sortBy, key_exps, ingredients);
        format(results.data);
        res.json(results);
    }else if(keywords.length == 0){
        let results = await sku_filter.ingredientsandLines(pageNum, sortBy, ingredients, product_lines);
        format(results.data);
        res.json(results);
    }else if(ingredients.length == 0){
        let results = await sku_filter.keywordsandLines(pageNum, sortBy, key_exps, product_lines);
        format(results.data);
        res.json(results);
    }else{
        let results = await sku_filter.allFilters(pageNum, sortBy, key_exps, ingredients, product_lines);
        format(results.data);
        res.json(results);
    }
}

module.exports = router;