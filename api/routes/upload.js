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
const ProductLine = require('../model/product_line_model');
var extract = require('extract-zip');

var storage = multer.diskStorage(
  {
      destination: './tmp/csv/',
      filename: function (req, file, cb) {
          cb( null, file.originalname);
      }
  }
);

var upload = multer({storage: storage});


var uploadSessionStarted = false;
var uploadHalfComplete = false;
var toBeCommitted = {
  ingredients: {
    changelist: null,
    createlist: null,
  },
  product_lines: {
    changelist: null,
    createlist: null,
  },
  skus: {
    changelist: null,
    createlist: null,
  },
  formulas: {
    changelist: null,
    createlist: null,
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
    if (req.body.commit = true) {
      commitChanges();
    }
    else {
      resetSession();
    }
  }
  else {
    res.json({
      success: false,
      uploadErrorType: 'Cannot commit if server is not ready'
    })
  }
});


  //This will be called when we have an array of csv's in our file system.
  async function handleFiles(res) {
    var errorOn = false;

    var csvFormulas = [];
    var csvIngredients = [];
    var csvSkus = [];
    var csvProduct_lines = [];
    // This object keeps track of what the import functions put into categories
    var results = {
      success: null,
      uploadErrorType: null,
      ingredients: {
        errorlist: null,
        changelist: null,
        createlist: null,
        ignorelist: null
      },
      product_lines: {
        errorlist: null,
        changelist: null,
        createlist: null,
        ignorelist: null
      },
      skus: {
        errorlist: null,
        changelist: null,
        createlist: null,
        ignorelist: null
      },
      formulas: {
        errorlist: null,
        changelist: null,
        createlist: null,
        ignorelist: null
      }
    };

    const directoryPath = path.join(__dirname, '../../tmp/csv/');
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
            if (file.substring(0,4) == 'skus') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .validate((data) => {
                  return ((data['SKU#'] != null) && (data['Name'] != null) && (data['Case UPC'] != null) && (data['Unit UPC'] != null) && (data['Unit size'] != null) && (data['Count per case'] != null) && (data['Product Line Name'] != null) && (data['Comment'] != null));
                })
                .on("data", function (data) {
                  csvSkus.push(data); // push each row
                })
                .on("end", function () {
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                })
                .on("data-invalid", function (error) {
                  results.success = false;
                  results.uploadErrorType = 'Skus csv file header error';
                  errorOn = true;
                  resolve();
                });
              });
  
              await csvPromise;
            }
            else if (file.substring(0,11) == 'ingredients') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .validate((data) => {
                  return ((data['Ingr#'] != null) && (data['Name'] != null) && (data['Vendor Info'] != null) && (data['Size'] != null) && (data['Cost'] != null) && (data['Comment'] != null));
                })
                .on("data", function (data) {
                  csvIngredients.push(data); // push each row
                })
                .on("end", function () {
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                })
                .on("data-invalid", function (error) {
                  results.success = false;
                  results.uploadErrorType = 'Ingredients csv file header error';
                  errorOn = true;
                  resolve();
                });
              });
  
              await csvPromise;
            }
            else if (file.substring(0,8) == 'formulas') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .validate((data) => {
                  return ((data['SKU#'] != null) && (data['Ingr#'] != null) && (data['Quantity'] != null));
                })
                .on("data", function (data) {
                  csvFormulas.push(data); // push each row
                })
                .on("end", function () {
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                })
                .on("data-invalid", function (error) {
                  results.success = false;
                  results.uploadErrorType = 'Formulas csv file header error';
                  errorOn = true;
                  resolve();
                });
              });
  
              await csvPromise;
            }
            else if (file.substring(0,13) == 'product_lines') {
              var csvPromise = new Promise(function (resolve2, reject2) {
                csv.fromPath('tmp/csv/' + file, {headers: true})
                .validate((data) => {
                  return data.Name != null;
                })
                .on("data", function (data) {
                  csvProduct_lines.push(data); // push each row
                })
                .on("end", function () {
                  fs.unlinkSync('tmp/csv/' + file);   // remove temp file
                  resolve2();
                })
                .on("data-invalid", function (error) {
                  results.success = false;
                  results.uploadErrorType = 'Product lines csv file header error';
                  errorOn = true;
                  resolve();
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
              resolve();
            }
          });
          resolve();
        }
      });
    });
    await fsPromise;
      
    if (!errorOn) {
      if (csvProduct_lines.length>0) {
        await handleProductLines(csvProduct_lines, results);
      }
  
      if (csvIngredients.length>0) {
        await handleIngredients(csvIngredients, results);
      }
  
      if (csvSkus.length>0) {
        await handleSkus(csvSkus, results);
      }
  
      if (csvFormulas.length>0) {
        await handleFormulas(csvFormulas, results);
      }
      // if theres errors, end the session
      if (results.ingredients.errorlist || results.skus.errorlist || results.product_lines.errorlist || results.formulas.errorlist) {
        uploadSessionStarted = false;
      }
      else {
        toBeCommitted.ingredients.createlist = results.ingredients.createlist;
        toBeCommitted.ingredients.changelist = results.ingredients.changelist;
        toBeCommitted.skus.createlist = results.skus.createlist;
        toBeCommitted.skus.changelist = results.skus.changelist;
        toBeCommitted.formulas.createlist = results.formulas.createlist;
        toBeCommitted.formulas.changelist = results.formulas.changelist;
        toBeCommitted.product_lines.createlist = results.product_lines.createlist;
        toBeCommitted.product_lines.changelist = results.product_lines.changelist;

        //if there's no errors and no potential changes, end the session and commit the changes
        if (!(results.ingredients.changelist || results.skus.changelist || results.product_lines.changelist || results.formulas.changelist)) {
          commitImport(res);
          results.success = true;
          uploadSessionStarted = false;
        }
        //if theres no errors, but there are changes, continue the session
        else {
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
    extract(file.path, {dir: 'tmp/csv/'}, async function (err) {
      // extraction is complete. make sure to handle the err
      if (err) {
        uploadSessionStarted = false;
        results.success = false;
        results.uploadErrorType = 'Zip error';
        res.json(results);
      }
      else {
        await handleFiles(res);
      }
     }
    )
  }

  async function handleProductLines(product_lines, results) {
    // check that headers are correct and
    //check for duplicates within the input csv
    var nameSet = new Set();
    product_lines.forEach((row) => {
      if (nameSet.has(row.Name)) {
        if (!results.product_lines.errorlist) {
          results.product_lines.errorlist = [];
        }
        results.product_lines.errorlist.push({
          message: 'Duplicate row in product lines',
          data: row
        });
      }
      else {
        nameSet.add(row.Name);
      }
    });

    await asyncForEach(product_lines, async (row) => {
      //if a product line is identical, add it to the ignore list
      var searchPromise = new Promise((resolve, reject) => {
        ProductLine.findOne({name: row.Name}).exec((err, result) => {
          if (result) {
            if (!results.product_lines.ignorelist) {
              results.product_lines.ignorelist = [];
            }
            results.product_lines.ignorelist.push(row);
          }
          // if it is not identical, add it to the create list
          else {
            if (!results.product_lines.createlist) {
              results.product_lines.createlist = [];
            }
            results.product_lines.createlist.push(row);
          }
          resolve();
        });
      });
      await searchPromise;
    });
    
  }

  async function handleSkus(skus, results) {

  }

  async function handleIngredients(ingredients, results) {

  }

  async function handleFormulas(formulas, results) {

  }

  async function commitImport(res) {
    var errorOn = false;
    if (toBeCommitted.product_lines.createlist) {
      await asyncForEach(toBeCommitted.product_lines.createlist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          ProductLine.createProductLine({name: row.Name}, (error) => {
            if (error) {
              errorOn = true;
              res.json({success: false, message: "Product line create failed"});
            }
            console.log('made it to create: ' + row.Name);
            resolve();
          });
        });
        await importPromise;
      });
    }
    if (toBeCommitted.ingredients.createlist && !errorOn) {
      await asyncForEach(toBeCommitted.ingredients.createlist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          var newngredient = {
            name: row.Name,
            number: row['Ingr#'],
            vendor_info: row['Vendor Info'],
            package_size: row['Size'],
            cost: row['Cost'],
            comment: row['Comment'],
          }
          Ingredient.createIngredient(newIngredient, (error) => {
              if (error) {
                errorOn = true;
                res.json({success: false, message: "ingredient create failed"});
              }
              resolve();
          });
        });
        await importPromise;
      });
    }
    
    if (toBeCommitted.ingredients.changelist && !errorOn) {
      await asyncForEach(toBeCommitted.ingredients.changelist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          var update = {
            name: row.Name,
            number: row['Ingr#'],
            vendor_info: row['Vendor Info'],
            package_size: row['Size'],
            cost: row['Cost'],
            comment: row['Comment'],
          }
          Ingredient.updateIngredient(row.Name, update, (error) => {
              if (error) {
                errorOn = true;
                res.json({success: false, message: "ingredient update failed"});
              }
              resolve();
          });
        });
        await importPromise;
      });
    }

    if (toBeCommitted.skus.createlist && !errorOn) {
      await asyncForEach(toBeCommitted.skus.createlist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          var newSKU = {
            name: row.Name,
            number: row['SKU#'],
            case_upc: row['Case UPC'],
            unit_upc: row['Unit UPC'],
            size: row['Unit size'],
            count: row['Count per case'],
            commment: row['Comment'],
            product_line: row['Product Line Name'],
            ingredients: []
          };
          SKU.createSKU(newSKU, (error) => {
            if (error) {
              errorOn = true;
              console.log(error);
              res.json({success: false, message: "SKU create failed"});
            }
            resolve();
          });
        });
        await importPromise;
      });
    }
    
    if (toBeCommitted.skus.changelist && !errorOn) {
      await asyncForEach(toBeCommitted.skus.changelist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          var update = {
            name: row.Name,
            number: row['SKU#'],
            case_upc: row['Case UPC'],
            unit_upc: row['Unit UPC'],
            size: row['Unit size'],
            count: row['Count per case'],
            commment: row['Comment'],
            product_line: row['Product Line Name'],
          };
          SKU.updateSKU(row['SKU#'], update, (error) => {
            if (error) {
              errorOn = true;
              console.log(error);
              res.json({success: false, message: "SKU update failed"});
            }
            resolve();
          });
        });
        await importPromise;
      });
    }
    
    if (toBeCommitted.formulas.createlist && !errorOn) {
      await asyncForEach(toBeCommitted.formulas.createlist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          SKU.addFormulaRow(row, (error) => {
            if (error) {
              errorOn = true;
              console.log(error);
              res.json({success: false, message: "Formula create failed"});
            }
            resolve();
          });
        });
        await importPromise;
      });
    }
    if (toBeCommitted.formulas.changelist && !errorOn) {
      await asyncForEach(toBeCommitted.formulas.changelist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          SKU.updateFormulaRow(row, (error) => {
            if (error) {
              console.log(error);
              res.json({success: false, message: "Formula update failed"});
            }
            resolve();
          });
        });
        await importPromise;
      });
    }

    resetSession();
  }

  function resetSession() {
    //reset our commit store
    toBeCommitted = {
      ingredients: {
        changelist: null,
        createlist: null,
      },
      product_lines: {
        changelist: null,
        createlist: null,
      },
      skus: {
        changelist: null,
        createlist: null,
      },
      formulas: {
        changelist: null,
        createlist: null,
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

  module.exports = router;