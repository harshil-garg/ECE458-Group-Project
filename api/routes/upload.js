const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

const validator = require('../controllers/validator');
const autogen = require('../controllers/autogen');
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const Formula = require('../model/formula_model');
const ProductLine = require('../model/product_line_model');
var extract = require('extract-zip');
const util = require('../../utils/utils');

const directoryPath = path.join(__dirname, '../../tmp/csv/');

var storage = multer.diskStorage(
  {
    destination: './tmp/csv/',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  }
);

var upload = multer({ storage: storage });


var uploadSessionStarted = false;
var uploadHalfComplete = false;
var toBeCommitted = {
  ingredients: {
    changelist: [],
    createlist: [],
  },
  product_lines: {
    createlist: []
  },
  skus: {
    changelist: [],
    createlist: [],
  },
  formulas: {
    createlist: [],
    changelist: []
  }
};

router.post('/', upload.array('file[]', 4), function (req, res) {
  if (uploadSessionStarted) {
    res.json({
      success: false,
      uploadErrorType: 'Session already started, please wait and try again'
    })
    return;
  }

  uploadSessionStarted = true;
  if (req.files.length == 1 && req.files[0].filename.includes('.zip')) {
    handleZip(req.files[0], res);
  }
  else {
    handleFiles(res);
  }
});

router.post('/commit', function (req, res) {
  if (uploadSessionStarted && uploadHalfComplete) {
    if (req.body.commit) {
      commitImport(res);
    }
    else {
      resetSession();
    }
    res.json({ success: true });
  }
  else {
    res.json({
      success: false,
      uploadErrorType: 'Upload session expired'
    })
  }
});


//This will be called when we have an array of csv's in our file system.
async function handleFiles(res) {
  var errorOn = false;

  var csvFormulas = [];
  var jsonFormulas = [];
  var csvIngredients = [];
  var jsonIngredients = [];
  var csvSkus = [];
  var jsonSkus = [];
  var csvProduct_lines = [];
  var jsonProduct_lines = [];
  // This object keeps track of what the import functions put into categories
  var results = {
    success: null,
    uploadErrorType: null,
    ingredients: {
      errorlist: [],
      changelist: [],
      createlist: [],
      ignorelist: []
    },
    product_lines: {
      errorlist: [],
      createlist: [],
      ignorelist: []
    },
    skus: {
      errorlist: [],
      changelist: [],
      createlist: [],
      ignorelist: []
    },
    formulas: {
      errorlist: [],
      createlist: [],
      ignorelist: []
    }
  };

  fsPromise = new Promise(function (resolve, reject) {
    fs.readdir(directoryPath, async function (err, files) {
      //handling error
      if (err) {
        results.success = false;
        results.uploadErrorType = 'fs error';
        errorOn = true;
        resolve();
      }
      else {
        await asyncForEach(files, async file => {
          if (file.substring(0, 4) == 'skus') {
            await handleCSV(file, resolve, SKU, sku_properties, csvSkus);
          }
          else if (file.substring(0, 11) == 'ingredients') {
            await handleCSV(file, resolve, Ingredient, ingredient_properties, csvIngredients);
          }
          else if (file.substring(0, 8) == 'formulas') {
            await handleCSV(file, resolve, Formula, formula_properties, csvFormulas);
          }
          else if (file.substring(0, 13) == 'product_lines') {
            await handleCSV(file, resolve, ProductLine, product_properties, csvProduct_lines);
          }
          else if (file.includes(".zip")) {
            // ignore if its the zip file
          }
          else {
            errorOn = true;
            results = {
              success: false,
              uploadErrorType: 'Incorrect csv name: ' + file
            };
            resolve();
          }
        });
        resolve();
      }
    });
  });
  await fsPromise;

  if (!errorOn) {
    if (jsonProduct_lines.length > 0) {
      await ProductLine.attemptImport(jsonProduct_lines, csvProduct_lines, results);
      // await handleProductLines(csvProduct_lines, results);
    }

    if (jsonIngredients.length > 0) {
      await Ingredient.attemptImport(jsonIngredients, csvIngredients, results);
      // await handleIngredients(csvIngredients, results);
    }

    if (jsonSkus.length > 0) {
      await SKU.attemptImport(jsonSkus, csvSkus, results);
      // await handleSkus(csvSkus, results);
    }

    if (jsonFormulas.length > 0) {
      await Formula.attemptImport(jsonFormulas, csvFormulas, results);
      // await handleFormulas(csvFormulas, results);
    }
    // if theres errors, end the session
    if (results.ingredients.errorlist.length || results.skus.errorlist.length || results.product_lines.errorlist.length || results.formulas.errorlist.length) {
      results.success = false;
      uploadSessionStarted = false;
    }
    else {
      toBeCommitted.ingredients.createlist = results.ingredients.createlist;
      toBeCommitted.ingredients.changelist = results.ingredients.changelist;
      toBeCommitted.skus.createlist = results.skus.createlist;
      toBeCommitted.skus.changelist = results.skus.changelist;
      toBeCommitted.formulas.createlist = results.formulas.createlist;
      toBeCommitted.product_lines.createlist = results.product_lines.createlist;

      //if there's no errors and no potential changes, commit the changes
      if (!(results.ingredients.changelist.length || results.skus.changelist.length)) {
        commitImport(res);
        results.success = true;
      }
      //if theres no errors, but there are changes, continue the session
      else {
        // end the session if the user doesn't submit consent or cancel after 2 mins
        setTimeout(() => { resetSession() }, 120000);
        results.success = false;
        uploadHalfComplete = true;
      }
    }
  }
  else {
    // if there was an upload error, reset the session
    uploadSessionStarted = false;
  }
  res.json(results);
}

async function handleZip(file, res) {
  var results = {};
  extract(file.path, { dir: directoryPath }, async function (err) {
    // extraction is complete. make sure to handle the err
    if (err) {
      console.log(err);
      uploadSessionStarted = false;
      results.success = false;
      results.uploadErrorType = 'Zip error';
      res.json(results);
    }
    else {
      fs.unlinkSync(file.path);
      handleFiles(res);
    }
  })
}

async function commitImport(res) {
  let product_result = await ProductLine.commitImport(toBeCommitted.ingredients.createlist);
  if(!product_result){
    res.json({ success: false, message: "Product Line commit failed" });
    return;
  }
  let ingredient_result = await Ingredient.commitImport(toBeCommitted.ingredients.createlist, toBeCommitted.ingredients.changelist);
  if(!ingredient_result){
    res.json({ success: false, message: "Ingredient commit failed" });
    return;
  }
  let sku_result = await SKU.commitImport(toBeCommitted.skus.createlist, toBeCommitted.skus.changelist);
  if(!sku_result){
    res.json({ success: false, message: "SKU commit failed" });
    return;
  }
  let formula_result = await SKU.commitImport(toBeCommitted.formulas.createlist, toBeCommitted.formulas.changelist);
  if(!formula_result){
    res.json({ success: false, message: "Formula commit failed" });
    return;
  }

  resetSession();
}

function resetSession() {
  //reset our commit store
  toBeCommitted = {
    ingredients: {
      changelist: [],
      createlist: [],
    },
    product_lines: {
      createlist: [],
    },
    skus: {
      changelist: [],
      createlist: [],
    },
    formulas: {
      createlist: [],
    }
  };
  //end session
  uploadSessionStarted = false;
  uploadHalfComplete = false;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

let sku_properties = ['SKU#', 'Name', 'Case UPC', 'Unit UPC', 'Unit size', 'Count per case', 'PL Name', 'Formula#', 'Formula factor', 'ML Shortnames', 'Rate', 'Comment'];
let ingredient_properties = ['Ingr#', 'Name', 'Vendor Info', 'Size', 'Cost', 'Comment'];
let product_properties = ['Name'];
let formula_properties = ['Formula#', 'Name', 'Ingr#', 'Quantity', 'Comment'];
async function handleCSV(file, resolve, model, model_properties, csv_list, json_list){
  var csvPromise = new Promise((resolve2, reject2) => {
    csv.fromPath('tmp/csv/' + file, {headers: true})
    .validate((data) => {
      let inputs_exist = true;
      for(let property of model_properties){
        inputs_exist = inputs_exist && !data[property];
      }
      return inputs_exist;
    })
    .on('data', (data) => {
      let newObj = preprocess(model, model_properties, data);
      json_list.push(newObj);
      csv_list.push(data);
    })
    .on('end', () => {
      fs.unlinkSync('tmp/csv/' + file);   // remove temp file
      resolve2();
    })
    .on('data-invalid', (error) => {
      results.success = false;
      results.uploadErrorType = `${model.name} csv file header error`;
      errorOn = true;
      fs.unlinkSync('tmp/csv/' + file);   // remove temp file
      resolve();
    });
  });
  await csvPromise;
}

function preprocess(model, properties, data){
  let obj = {};
  let model_keys = Object.keys(model.schema.obj);
  let j = 0;
  for(let i = 0; i < properties.length; i++){
    if(model.name == 'Ingredient'){
      if(properties[i] == 'Unit size'){
        let size = data[properties[i]].split(' ');
        obj['package_size'] = size[0];
        obj['unit'] = size[0];
        j++;
      }
    }else if(model.name == 'Formula'){
      if(properties[i] == 'Ingr#'){
        obj['ingredient'] = data[properties[i]];
      }else if(properties[i] == 'Quantity'){
        let quantity = data[properties[i]].split(' ');
        obj['quantity'] = quantity[0];
        obj['unit'] = quantity[1];
        j++;
      }
    }else if(key == 'ML Shortnames'){
      obj[model_keys[j]] = data[properties[i]].split(',');
    }else{
      obj[model_keys[j]] = data[properties[i]];    
    }
    j++;
  }

  return obj;
}


module.exports = router;