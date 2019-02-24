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
    format_skus(results.data);
    res.json(results);
});

router.post('/product_lines', async (req, res) => {
    let agg = ProductLine.aggregate({$match: {}});

    let results = await pagination.paginate(agg, pageNum, 'name', 0);
    format_product_lines(results.data);
    res.json(results);
});

router.post('/formulas', async (req, res) => {
    const { sortBy, keywords, ingredients } = req.body;
    const required_params = { sortBy, keywords, ingredients };

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    let results = await formula_filter.filter(pageNum, sortBy, 0, key_exps, ingredients);
    format_formulas(results.data);
    res.json(results);
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
        sku['PL Name'] = sku.product_line;
        delete sku.product_line;
        sku['Formula#'] = sku.formula.number;
        delete sku.formula;
        sku['Formula Factor'] = sku.formula_scale_factor;
        delete sku.formula_scale_factor;

        let mls = [];
        for(let ml of sku.manufacturing_lines){
            mls.push(ml.shortname);
        }
        sku['ML Shortnames'] = mls;
        delete sku.manufacturing_lines;
        sku['Rate'] = sku.manufacturing_rate;
        delete sku.manufacturing_rate;
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

function format_formulas(formulas){
    for(let formula of formulas){
        formula['Formula#'] = formula.number;
        delete formula.number;
        formula['Name'] = formula.name;
        delete formula.name;

        let ingredients = [];
        let quantities = [];
        for(let tuple of formula.ingredient_tuples){
            ingredients.push(tuple.ingredient.number);
            let unit = tuple.unit.replace(/\W/g, '');
            quantities.push(`${tuple.quantity} ${unit}`);
        }

        formula['Ingr#'] = ingredients;
        formula['Quantity'] = quantities;
        formula['Comment'] = comment;
    }
}


module.exports = router;