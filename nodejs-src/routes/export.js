const express = require('express');
const router = express.Router();
const ingredient_filter = require('../controllers/ingredient_filter');
const sku_filter = require('../controllers/sku_filter');
const formula_filter = require('../controllers/formula_filter');
const pagination = require('../controllers/paginate');
const ProductLine = require('../model/product_line_model');
let pageNum = -1; //return all, don't paginate

router.post('/ingredients', async (req, res) => {
    const { sortBy, keywords, skus} = req.body;
    const required_params = { sortBy, keywords, skus };

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    let results = await ingredient_filter.filter(pageNum, sortBy, 0, key_exps, skus);
    res.json({success: true, data: format_ingredients(results.data)});
});

router.post('/skus', async (req, res) => {
    const { sortBy, keywords, ingredients, product_lines } = req.body;
    const required_params = { sortBy, keywords, ingredients, product_lines };

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    let results = await sku_filter.filter(pageNum, sortBy, 0, key_exps, ingredients, product_lines);
    res.json({success: true, data: format_skus(results.data)});
});

router.post('/product_lines', async (req, res) => {
    let agg = ProductLine.aggregate([{$match: {}}]);

    let results = await pagination.paginate(agg, pageNum, 'name', 0);
    res.json({success: true, data: format_product_lines(results.data)});
});

router.post('/formulas', async (req, res) => {
    const { sortBy, keywords, ingredients } = req.body;
    const required_params = { sortBy, keywords, ingredients };

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    let results = await formula_filter.filter(pageNum, sortBy, 0, key_exps, ingredients);
    res.json({success: true, data: format_formulas(results.data)});
});


function format_ingredients(ingredients) {
    result = [];
    for(let ingredient of ingredients){
        new_ingredient = {};
        new_ingredient['Ingr#'] = ingredient.number;
        new_ingredient['Name'] = ingredient.name;
        new_ingredient['Vendor Info'] = ingredient.vendor_info;
        new_ingredient['Size'] = `${ingredient.package_size} ${ingredient.unit}`;
        new_ingredient['Cost'] = ingredient.cost;
        new_ingredient["Comment"] = ingredient.comment;
        result.push(new_ingredient);
    }
    return result;
}

function format_skus(skus) {
    result = [];
    for(let sku of skus){
        newsku = {};
        newsku['SKU#'] = sku.number;
        newsku['Name'] = sku.name;
        newsku['Case UPC'] = sku.case_upc;
        newsku['Unit UPC'] = sku.unit_upc;
        newsku['Unit size'] = sku.size;
        newsku['Count per case'] = sku.count;
        newsku['PL Name'] = sku.product_line;
        newsku['Formula#'] = sku.formula.number;
        newsku['Formula factor'] = sku.formula_scale_factor;

        let mls = `"`;
        let counter = 0;
        for(let ml of sku.manufacturing_lines){
            mls += `${ml.shortname}${counter == headers.length-1 ? '"' : ','}`;
            counter++;
        }
        newsku['ML Shortnames'] = mls;
        newsku['Rate'] = sku.manufacturing_rate;
        newsku['Comment'] = sku.comment;
        result.push(newsku);
    }
    return result;
}

function format_product_lines(product_lines) {
    let result = [];
    for(let line of product_lines){
        let newline = {};
        newline['Name'] = line.name;
        result.push(newline);
    }
    return result;
}

function format_formulas(formulas){
    let result = [];
    for(let formula of formulas){
        // let ingredients = [];
        // let quantities = [];
        let first = true;
        for(let tuple of formula.ingredient_tuples){
            newformula = {};
            newformula['Formula#'] = formula.number;
            newformula['Name'] = formula.name;
            newFormula['Ingr#'] = tuple.ingredient.number;
            newformula['Quantity'] = `${tuple.quantity} ${tuple.unit}`;
            newformula['Comment'] = first ? formula.comment : '';
            first = false;
            result.push(newformula);
        }
    }
    return result;
}


module.exports = router;
