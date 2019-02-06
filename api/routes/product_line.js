const express = require('express');
const router = express.Router();
const ProductLine = require('../model/product_line_model');
const SKU = require('../model/sku_model');
const pagination = require('../controllers/paginate');
const input_validator = require('../controllers/input_validation');
const validator = require('../controllers/product_line_validation');


//Create
router.post('/create', (req, res) => {
    const {name} = req.body;
    //check required fields
    const required_params = { name };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let product_line = new ProductLine({name});
    ProductLine.createProductLine(product_line, (err) => {
        if(err){
            res.json({success: false, message: `Failed to create product line. Error: ${err}`});
        }else{
            res.json({success: true, message: "Created successfully"});
        }
    });
});

//Read
router.post('/read', async (req, res) => {
    const {pageNum}  = req.body;
    const required_params = { pageNum };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let filter = ProductLine.find({});
    let results = await pagination.paginate(filter, ProductLine, pageNum, 'name');
    res.json(results);
});

//Update
router.post('/update', (req, res) => {
    const { name, newname } = req.body;
    const required_params = { name, newname };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    var json = {};

    if (newname) {
        json["name"] = newname;
    }

    ProductLine.updateProductLine(name, json, async (error) => {
        if (error) {
            res.json({success: false, message: `Failed to update product line. Error: ${error}`});
        } else {
            await SKU.update({product_line: name}, {product_line: newname}, {multi: true}).exec();
            res.json({success: true, message: "Updated successfully."});
        }
    });
});

//Delete
router.post('/delete', async (req, res) => {
    const {name} = req.body;
    const required_params = { name };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let bool = await validator.in_use(name);

    if(bool){
        res.json({success: false, message: 'Cannot delete, SKUs dependent on this line'});
        return;
    }

    ProductLine.deleteProductLine(name, (err, result) => {
        if(err) {
            res.json({success: false, message: `Failed to delete product line. Error: ${err}`});

        }else if(result.deletedCount == 0){
            res.json({success: false, message: 'Product Line does not exist to delete'});
        }else{
            res.json({success: true, message: "Deleted successfully."});
        }
    })
});
module.exports = router;