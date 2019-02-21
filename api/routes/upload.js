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

const directoryPath = path.join(__dirname, '../../tmp/csv/');

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
    res.json({success: true});
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
    var csvIngredients = [];
    var csvSkus = [];
    var csvProduct_lines = [];
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
    extract(file.path, {dir: directoryPath}, async function (err) {
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
     }
    )
  }

  async function handleProductLines(product_lines, results) {
    //check for duplicates within the input csv
    var nameSet = new Set();
    product_lines.forEach((row) => {
      if (nameSet.has(row.Name)) {
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
            results.product_lines.ignorelist.push(row);
          }
          // if it is not identical, add it to the create list
          else {
            results.product_lines.createlist.push(row);
          }
          resolve();
        });
      });
      await searchPromise;
    });
    
  }

  async function handleSkus(skus, results) {
    //check for duplicates within the input csv
    var numberSet = new Set();
    var caseUPCSet = new Set();

    skus.forEach((row) => {
      if (numberSet.has(row['SKU#'])) {
        results.skus.errorlist.push({
          message: 'Duplicate row in SKUs',
          data: row
        });
        return;
      }
      else {
        numberSet.add(row['SKU#']);
      }
      if (caseUPCSet.has(row['Case UPC'])) {
        results.skus.errorlist.push({
          message: 'Duplicate row in SKUs',
          data: row
        });
      }
      else {
        caseUPCSet.add(row['Case UPC']);
      }
    });

    await asyncForEach(skus, async (row) => {
      var searchPromise = new Promise((resolve, reject) => {
        SKU.findOne({number: row['SKU#']}).exec(async (err, result) => {
          // if we find an existing entry, we check to ignore, change, or error
          if (result) {
            //if a SKU is identical, add it to the ignore list
            if (result.name == row['Name'] && result.case_upc == row['Case UPC'] && result.unit_upc == row['Unit UPC'] && result.count == row['Count per case'] && result.product_line == row['Product Line Name'] && result.comment == row['Comment']) {
              results.skus.ignorelist.push(row);
            }
            // if matches on the primary key AND the unique key, validate and update
            else if (result.case_upc == row['Case UPC']) {
              if (await validateSKU(row, results)) {
                results.skus.changelist.push(row);
              }
            }
            // if it matches on the primary key AND another row's unique key, it should fail
            else {
              var validatePromise = new Promise ((resolve2, reject2) => {
                SKU.findOne({case_upc: row['Case UPC']}).exec(async (err, result) => {
                  if (result) {
                    console.log('this is in fact what happneed');
                    results.skus.errorlist.push({
                      message: 'Ambiguous record',
                      data: row
                    });
                  }
                  // other wise validate and update
                  else {
                    if (await validateSKU(row, results)) {
                      results.skus.changelist.push(row);
                    }
                  }
                  resolve2();
                }); 
              });
              await validatePromise;
            }
          }
          // if it is not a match on the primary key, validate it
          else {
            //if its a match on a unique key, it should fail
            var validatePromise = new Promise ((resolve2, reject2) => {
              SKU.findOne({case_upc: row['Case UPC']}).exec(async (err, result) => {
                if (result) {
                  results.skus.errorlist.push({
                    message: 'Ambiguous record',
                    data: row
                  });
                }
                // other wise validate and add
                else {
                    var validated = await validateSKU(row, results);
                    if (validated) {
                      results.skus.createlist.push(row);
                    }
                }
                resolve2();
              });
            });
            await validatePromise;
          }
          resolve();
        });
      });
      await searchPromise;
    });
  }

  async function handleIngredients(ingredients, results) {
    //check for duplicates within the input csv
    var nameSet = new Set();
    var numberSet = new Set();

    ingredients.forEach((row) => {
      if (nameSet.has(row['Name'])) {
        results.ingredients.errorlist.push({
          message: 'Duplicate row in ingredients',
          data: row
        });
        return;
      }
      else {
        nameSet.add(row.Name);
      }
      if (numberSet.has(row['Ingr#'])) {
        results.ingredients.errorlist.push({
          message: 'Duplicate row in ingredients',
          data: row
        });
      }
      else {
        numberSet.add(row['Ingr#']);
      }
    });

    await asyncForEach(ingredients, async (row) => {
      var searchPromise = new Promise((resolve, reject) => {
        Ingredient.findOne({number: row['Ingr#']}).exec(async (err, result) => {
          // if we find an existing entry, we check to ignore, change, or error
          if (result) {
            //if an ingredient is identical, add it to the ignore list
            if (result.name == row['Name'] && result.vendor_info == row['Vendor Info'] && result.package_size == row['Size'] && result.cost == row['Cost'] && result.comment == row['Comment']) {
              results.ingredients.ignorelist.push(row);
            }
            // if matches on the primary key AND the unique key, validate and update
            else if (result.name == row['Name']) {
              if (await validateIngredient(row, results)) {
                results.ingredients.changelist.push(row);
              }
            }
            // if it matches on the primary key AND another row's unique key, it should fail
            else {
              var validatePromise = new Promise ((resolve2, reject2) => {
                Ingredient.findOne({name: row['Name']}).exec( async (err, result) => {
                  if (result) {
                    results.ingredients.errorlist.push({
                      message: 'Ambiguous record',
                      data: row
                    });
                  }
                  // other wise validate and update
                  else {
                    var result = await validateIngredient(row, results);
                    if (result) {
                      results.ingredients.changelist.push(row);
                    }
                  }
                  resolve2();
                }); 
              });
              await validatePromise;
            }
          }
          // if it is not a match on the primary key, validate it
          else {
            //if its a match on a unique key, it should fail
            var validatePromise = new Promise ((resolve2, reject2) => {
              Ingredient.findOne({name: row['Name']}).exec(async (err, result) => {
                if (result) {
                  results.ingredients.errorlist.push({
                    message: 'Ambiguous record',
                    data: row
                  });
                }
                // other wise validate and add
                else {
                  var validated = await validateIngredient(row, results);
                  if (validated) {
                    results.ingredients.createlist.push(row);
                  }
                }
                resolve2();
              });
            });
            await validatePromise;
          }
          resolve();
        });
      });
      await searchPromise;
    });
  }

  function pairListHas(list, skuNum, ingrNum) {
    list.forEach((entity) => {
      if (entity.skuNum == skuNum && entity.ingrNum == ingrNum) {
        return true;
      }
    });
    return false;
  }

  async function handleFormulas(formulas, results) {
    //check for duplicates within the input csv
    var pairList = [];

    formulas.forEach((row) => {
      if (pairListHas(pairList, row['SKU#'], row['Ingr#'])) {
        results.formulas.errorlist.push({
          message: 'Duplicate row in formulas',
          data: row
        });
      }
      else {
        pairList.push({ingrNum: row['Ingr#'], skuNum: row['SKU#']});
      }
    });
    // for each row, check that sku exists, ingredient number exists, and quantity is a number
    await asyncForEach(formulas, async (formula) => {
      var error = false;
      if (isNaN(formula['Quantity']) || formula['Quantity'] == '') {
        results.formulas.errorlist.push({
          message: 'A Quantity in formula is not a number',
          data: formula
        });
        error = true;
      }
      var skuFound = false;
      results.skus.createlist.forEach((sku) => {
        if (sku['SKU#'] == formula['SKU#']) {
          skuFound = true;
        }
      });
      if (!skuFound) {
        var searchResult = await SKU.findOne({number: formula['SKU#']}).exec();
        if (!searchResult) {
          results.formulas.errorlist.push({
            message: 'SKU# doesnt exist outside of this formula',
            data: formula
          });
          error = true;
        }
      }
      var ingrFound = false;
      results.ingredients.createlist.forEach((ingredient) => {
        if (ingredient['Ingr#'] == formula['Ingr#']) {
          ingrFound = true;
        }
      });
      if (!ingrFound) {
        var searchResult = await Ingredient.findOne({number: formula['Ingr#']}).exec();
        if (!searchResult) {
          results.formulas.errorlist.push({
            message: 'Ingr# doesnt exist outside of this formula',
            data: formula
          });
          error = true;
        }
      }
      if (!error) {
        results.formulas.createlist.push(formula);
      }
    });
  }
  // returns true if the row is valid syntactically and referentially
  // otherwise returns false and adds the row to the errorlist with the correct explanation message
  async function validateSKU(sku, results) {
    if (!skuValidator.isUPCStandard(sku['Case UPC'] || !skuValidator.isUPCStandard(sku['Unit UPC']))) {
      results.skus.errorlist.push({
        message: 'UPC numbers are not up to standard',
        data: sku
      });
      return false;
    }
    if (isNaN(sku['SKU#'] || isNaN(sku['Count per case']))) {
      results.skus.errorlist.push({
        message: 'A value that must be a number is not a number',
        data: sku
      });
      return false;
    }
    // check whether there is a product line in product lines
    // if not, check whether there is a product line in the document
    var found = false;
    for (var row of results.product_lines.createlist) {
      if (row['Name'] == sku['Product Line Name']) {
        found = true;
        break;
      }
    }
    if (!found) {
      var searchPromise = new Promise((resolve, reject) => {
        ProductLine.findOne({name: sku['Product Line Name']}, (err, result) => {
          if (!result) {
            results.skus.errorlist.push({
              message: 'This SKU is referring to a product line that does not exist',
              data: sku
            });
            resolve(false);
          }
          else {
            resolve(true);
          }
        });
      });
      if (!(await searchPromise)) {
        return false;
      }
    }

    //if we are creating a new SKU and no number is supplied we create a number
    if (sku['SKU#'] == '') {
      sku['SKU#'] = await create_SKU_number();
    }
    return true;
  }

  // returns true if the row is valid syntactically
  // otherwise returns false and adds the row to the errorlist with the correct explanation message
  async function validateIngredient(ingredient, results) {
    if (isNaN(ingredient['Ingr#']) || isNaN(ingredient['Cost'])) {
      results.ingredients.errorlist.push({
        message: 'A value that must be a number is not a number',
        data: ingredient
      });
      return false;
    }
    // if we are creating a new ingredient and no number is supplied, 
    if (ingredient['Ingr#'] == '') {
      ingredient['Ingr#'] == await create_ingredient_number();
    }
    ingredient['Cost'] = Number(ingredient['Cost']).toFixed(2);
    return true;
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
            resolve();
          });
        });
        await importPromise;
      });
    }
    if (toBeCommitted.ingredients.createlist && !errorOn) {
      await asyncForEach(toBeCommitted.ingredients.createlist, async (row) => {
        var importPromise = new Promise((resolve, reject) => {
          var newIngredient = {
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
            comment: row['Comment'],
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
        await SKU.importFormulas(toBeCommitted.formulas.createlist)
        .catch((error) => {
          res.json({success: false, message: "Formula create failed"});
        });
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

  async function create_ingredient_number() {
    var searchPromise = new Promise((resolve, reject) => {
      Ingredient.find().sort({number: 1}).collation({locale: "en_US", numericOrdering: true}).exec(function(error, ingredients) {
        if (error) reject();
        if (!ingredients) {
          resolve(0);
        }
        resolve(smallest_missing_number(ingredients, 0, ingredients.length - 1));
      });
    });
    return await searchPromise;
  }

  async function create_SKU_number() {
    var searchPromise = new Promise((resolve, reject) => {
      SKU.find().sort({number: 1}).collation({locale: "en_US", numericOrdering: true}).exec(function(error, results) {
        if (error) reject();
        if (!results) {
          resolve(0);
        }
         resolve(smallest_missing_number(results, 0, results.length - 1));
      });
    });
    return await searchPromise;
  }

  function smallest_missing_number(list, lo, hi) {
    if (lo > hi)
        return lo + 1;
    let mid =  Math.floor(lo + (hi - lo) / 2);

    if (list[mid].number == mid+1) {
        return smallest_missing_number(ingredients, mid + 1, hi);
    } else {
        return smallest_missing_number(ingredients, lo, mid - 1);
  }
}

  module.exports = router;