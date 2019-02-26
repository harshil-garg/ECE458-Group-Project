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
    result = [];
    newsku = {};
    newsku['SKU#'] = '1';
    newsku['Name'] = 'skuname';
    newsku['Case UPC'] = '005102218476';
    newsku['Unit UPC'] = '364802618604';
    newsku['Unit size'] = '28 oz';
    newsku['Count per case'] = '24';
    newsku['PL Name'] = 'prod line';
    newsku['Formula#'] = '1';
    newsku['Formula factor'] = '1.0';

    newsku['ML Shortnames'] = 'name1name2'
    newsku['Rate'] = '1.0';
    newsku['Comment'] = 'testcomment';
    result.push(newsku);



    // for(let sku of skus){
    //     newsku = {};
    //     newsku['SKU#'] = sku.number;
    //     newsku['Name'] = sku.name;
    //     newsku['Case UPC'] = sku.case_upc;
    //     newsku['Unit UPC'] = sku.unit_upc;
    //     newsku['Unit size'] = sku.size;
    //     newsku['Count per case'] = sku.count;
    //     newsku['PL Name'] = sku.product_line;
    //     newsku['Formula#'] = sku.formula.number;
    //     newsku['Formula factor'] = sku.formula_scale_factor;

    //     let mls = [];
    //     for(let ml of sku.manufacturing_lines){
    //         mls.push(ml.shortname);
    //     }
    //     newsku['ML Shortnames'] = mls;
    //     newsku['Rate'] = sku.manufacturing_rate;
    //     newsku['Comment'] = sku.comment;
    //     console.log('here');
    //     console.log(sku.ingredients);
    //     delete sku.ingredients;
    //     result.push(newsku);
    // }
    return result;
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