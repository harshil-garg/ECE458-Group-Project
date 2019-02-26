const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const Formula = require('../model/formula_model');
const ProductLine = require('../model/product_line_model');
var extract = require('extract-zip');

const directoryPath = path.join(__dirname, '../tmp/csv/');

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
    changelist: [],
    createlist: []
  }
};


router.post('/', upload.array('file[]', 4), async (req, res) => {
  if (uploadSessionStarted) {
    res.json({
      success: false,
      uploadErrorType: 'Session already started, please wait and try again'
    })
    return;
  }

  uploadSessionStarted = true;
  if (req.files.length == 1 && req.files[0].filename.includes('.zip')) {
    await handleZip(req.files[0], res)//.catch((err) => {return});
  }
  else {
    await handleFiles(res)//.catch((err) => {return});
  }
});

router.post('/commit', async (req, res) => {
  if (uploadSessionStarted && uploadHalfComplete) {
    if (req.body.commit) {
      let failed = false;
      await commitImport()
      // .catch((err) => {
      //   res.json({success: false, message: err});
      //   failed = true;
      // });
      // if(failed){
      //   return;
      // }
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
      changelist_model: [],
      createlist: [],
      createlist_model: [],
      ignorelist: []
    },
    product_lines: {
      errorlist: [],
      createlist: [],
      createlist_model: [],
      ignorelist: []
    },
    skus: {
      errorlist: [],
      changelist: [],
      changelist_model: [],
      createlist: [],
      createlist_model: [],
      ignorelist: []
    },
    formulas: {
      errorlist: [],
      changelist: [],
      changelist_model: [],
      createlist: [],
      createlist_model: [],
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
            await handleCSV(file, results, reject, SKU, sku_properties, csvSkus, jsonSkus);
          }
          else if (file.substring(0, 11) == 'ingredients') {
            await handleCSV(file, results, reject, Ingredient, ingredient_properties, csvIngredients, jsonIngredients);
          }
          else if (file.substring(0, 8) == 'formulas') {
            await handleCSV(file, results, reject, Formula, formula_properties, csvFormulas, jsonFormulas);
          }
          else if (file.substring(0, 13) == 'product_lines') {
            await handleCSV(file, results, reject, ProductLine, product_properties, csvProduct_lines, jsonProduct_lines);
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
            fs.unlinkSync('tmp/csv/' + file);   // remove temp file
            resolve();
          }
        });
        resolve();
      }
    });
  });
  await fsPromise.catch((err) => {errorOn = true});

  if(!errorOn){
    if (jsonProduct_lines.length > 0) {
      await ProductLine.attemptImport(jsonProduct_lines, csvProduct_lines, results);
    }
  
    if (jsonIngredients.length > 0) {
      console.log('trying')
      await Ingredient.attemptImport(jsonIngredients, csvIngredients, results);
    }
  
    if (jsonSkus.length > 0) {
      await SKU.attemptImport(jsonSkus, csvSkus, results);
    }
  
    if (jsonFormulas.length > 0) {
      await Formula.attemptImport(jsonFormulas, csvFormulas, results);
    }
    // if theres errors, end the session
    if (results.ingredients.errorlist.length || results.skus.errorlist.length || results.product_lines.errorlist.length || results.formulas.errorlist.length) {
      results.success = false;
      uploadSessionStarted = false;
    }else {
      toBeCommitted.ingredients.createlist = results.ingredients.createlist_model;
      toBeCommitted.ingredients.changelist = results.ingredients.changelist_model;
      toBeCommitted.skus.createlist = results.skus.createlist_model;
      toBeCommitted.skus.changelist = results.skus.changelist_model;
      toBeCommitted.formulas.createlist = results.formulas.createlist_model;
      toBeCommitted.formulas.changelist = results.formulas.changelist_model;
      toBeCommitted.product_lines.createlist = results.product_lines.createlist_model;
  
      //if there's no errors and no potential changes, commit the changes
      if (!(results.ingredients.changelist.length || results.skus.changelist.length)) {
        await commitImport()
        .then(() => {
          results.success = true;
        })
        .catch((err) =>{
          results = {
            success: false,
            uploadErrorType: 'MongoDB error:' + err.toString()
          };

        });
      }
      //if theres no errors, but there are changes, continue the session
      else {
        // end the session if the user doesn't submit consent or cancel after 2 mins
        setTimeout(() => { resetSession() }, 120000);
        results.success = false;
        uploadHalfComplete = true;
      }
    }
  }else{
    // if there was an upload error, reset the session
    uploadSessionStarted = false;
  }
  
  res.json(results);
}

async function handleZip(file, res) {
  var results = {};
  await extract(file.path, { dir: directoryPath }, async (err) => {
    // extraction is complete. make sure to handle the err
    if (err) {
      uploadSessionStarted = false;
      results.success = false;
      results.uploadErrorType = 'Zip error';
      res.json(results);
      throw err;
    }
    else {
      fs.unlinkSync(file.path);
      await handleFiles(res).catch((err) => {return});
    }
  }).catch((err) => {return})
}

async function handleCSV(file, results, reject, model, model_properties, csv_list, json_list){
  var csvPromise = new Promise((resolve2, reject2) => {
    csv.fromPath('tmp/csv/' + file, {headers: true})
    .validate((data) => {
      let inputs_exist = true;
      for(let property of model_properties){
        //non required/autogenerated fields
        if(property == 'SKU#' || (property == 'Ingr#' && model.modelName == 'Ingredient') || (property == 'Formula#' && model.modelName == 'Formula') || property == 'Formula factor' || property == 'Vendor Info' || property == 'Comment'){
          inputs_exist = inputs_exist && (data[property] != null);
        }else{
          //required fields
          inputs_exist = inputs_exist && !(!data[property]);  
        }   
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
      results.uploadErrorType = `${model.modelName} csv file header error`;
      reject(error);
    });
  });
  await csvPromise;
}

async function commitImport() {
  if(toBeCommitted.product_lines.createlist.length > 0){
    await ProductLine.commitImport(toBeCommitted.product_lines.createlist).catch((err) => {throw err});
  }
  if(toBeCommitted.ingredients.createlist.length > 0 || toBeCommitted.ingredients.changelist.length > 0){
    await Ingredient.commitImport(toBeCommitted.ingredients.createlist, toBeCommitted.ingredients.changelist).catch((err) => {throw err});
  }
  
  if(toBeCommitted.skus.createlist.length > 0 || toBeCommitted.skus.changelist.length > 0){
    await SKU.commitImport(toBeCommitted.skus.createlist, toBeCommitted.skus.changelist).catch((err) => {throw err});
  }

  if(toBeCommitted.formulas.createlist.length > 0 || toBeCommitted.formulas.changelist.length > 0){
    await Formula.commitImport(toBeCommitted.formulas.createlist, toBeCommitted.formulas.changelist).catch((err) => {throw err});
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


function preprocess(model, properties, data){
  let obj = {};
  let model_keys = Object.keys(model.schema.obj);
  let j = 0;
  for(let i = 0; i < properties.length; i++){
    if(model.modelName == 'Ingredient' && properties[i] == 'Size'){
      let size = data[properties[i]].split(' ');
      obj['package_size'] = size[0];
      obj['unit'] = size[1];
      j++;     
    }else if(model.modelName == 'Formula' && properties[i] == 'Ingr#'){
      obj['ingredient'] = data[properties[i]];
    }else if(model.modelName == 'Formula' && properties[i] == 'Quantity'){
      let quantity = data[properties[i]].split(' ');
      obj['quantity'] = quantity[0];
      obj['unit'] = quantity[1];
      j--;
    }else if(properties[i] == 'ML Shortnames'){
      obj[model_keys[j]] = data[properties[i]].split(',');
    }else{
      obj[model_keys[j]] = data[properties[i]];    
    }
    j++;
  }
  console.log(obj)
  return obj;
}

module.exports = router;
