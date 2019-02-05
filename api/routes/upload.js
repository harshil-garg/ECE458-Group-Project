const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

const skuValidator = require('../controllers/sku_validation');
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const ManufacturingGoalModel = require('../model/manufacturing_goal_model');
var extract = require('extract-zip');

var storage = multer.diskStorage(
  {
      destination: './tmp/csv/',
      filename: function ( req, file, cb ) {
          //req.body is empty...
          //How could I get the new_file_name property sent from client here?
          cb( null, file.originalname);
      }
  }
);

var upload = multer({storage: storage});

var uploadSessionStarted = false;
var uploadHalfComplete = false;
var toBeCommitted = {};

router.post('/', upload.array('file[]', 4), async function (req, res) {
    if (uploadSessionStarted) {
      res.json({
        success: false,
        uploadErrorType: 'Session already started'
      })
      return;
    }

    uploadSessionStarted = true;
    if (req.files.length == 1 && req.files[0].filename.includes('.zip')) {
      await handleZip(req.files[0], res);
    }
    else {
      await handleFiles(res);
    }
  });

router.post('/commit', async function (req, res) {
  if (uploadSessionStarted && uploadHalfComplete) {

  }
  else {
    res.json({
      success: false,
      uploadErrorType: 'Cannot commit if server is not ready'
    })
  }
});


  //This will be called when we have an array of files.
  async function handleFiles(res) {
    var errorOn = false;

    var formulas = [];
    var ingredients = [];
    var skus = [];
    var product_lines = [];
    var results = {};

    const directoryPath = path.join(__dirname, '../../tmp/csv/');
    fsPromise = new Promise(function (resolve, reject) {
      fs.readdir(directoryPath, async function (err, files) {
        //handling error
        if (err) {
            results['success'] = false;
            results['uploadErrorType'] = 'fs error';
            errorOn = true;
            resolve();
        } 
        else {
          await asyncForEach(files, async file => {
            if (file.substring(0,4) == 'skus') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .on("data", function (data) {
                  skus.push(data); // push each row
                })
                .on("end", function () {
                  console.log(skus);
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                });
              });
  
              await csvPromise;
            }
            else if (file.substring(0,11) == 'ingredients') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .on("data", function (data) {
                  ingredients.push(data); // push each row
                })
                .on("end", function () {
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                });
              });
  
              await csvPromise;
            }
            else if (file.substring(0,8) == 'formulas') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .on("data", function (data) {
                  formulas.push(data); // push each row
                })
                .on("end", function () {
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                });
              });
  
              await csvPromise;
            }
            else if (file.substring(0,13) == 'product_lines') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .on("data", function (data) {
                  product_lines.push(data); // push each row
                })
                .on("end", function () {
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                });
              });
  
              await csvPromise;
            }
            else {
              errorOn = true;
              results = {
                success: false,
                uploadErrorType: 'Incorrect csv name: ' + file
              };
            }
            resolve();
          });
        }
      });
    });

    await fsPromise
    if (!errorOn) {
      if (product_lines.length>0) {
        await handleProductLines(product_lines, results);
      }
  
      if (ingredients.length>0) {
        await handleIngredients(ingredients, results);
      }
  
      if (skus.length>0) {
        await handleSkus(skus, results);
      }
  
      if (formulas.length>0) {
        await handleFormulas(formulas, results);
      }
      //if there's no errors and no potential changes, end the session and commit the changes
      if (!(results.ingredients.errorlist || results.skus.errorlist || results.product_lines.errorlist || results.formulas.errorlist) && !(results.ingredients.changelist || results.skus.changelist || results.product_lines.changelist || results.formulas.changelist)) {
        await commitImport();
        uploadSessionStarted = false;
      }
      // if theres errors, end the session
      if (results.ingredients.errorlist || results.skus.errorlist || results.product_lines.errorlist || results.formulas.errorlist) {
        uploadSessionStarted = false;
      }
      //if theres no errors, but there are changes, continue the session
      if (!(results.ingredients.errorlist || results.skus.errorlist || results.product_lines.errorlist || results.formulas.errorlist) && (results.ingredients.changelist || results.product_lines.changelist || results.skus.changelist || results.formulas.changelist)) {
        uploadHalfComplete = true;
      }
    }
    else {
      uploadSessionStarted = false;
    }
    res.json(results);
  }

  async function handleZip(file, res) {
    results = {};
    extract(file.path, {dir: 'tmp/csv/'}, async function (err) {
      // extraction is complete. make sure to handle the err
      if (err) {
        uploadSessionStarted = false;
        results['success'] = false;
        results['uploadErrorType'] = 'Zip error';
        res.json(results);
      }
      else {
        await handleFiles(res);
      }
     }
    )
  }

  async function commitImport() {

  }

  async function handleProductLines(product_lines, results) {
    
  }

  async function handleSkus(skus, results) {

  }

  async function handleIngredients(ingredients, results) {

  }

  async function handleFormulas(formulas, results) {

  }

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  module.exports = router;