const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const csv = require('fast-csv');

router.post('/', upload.single('file'), function (req, res) {
    const fileRows = [];
  
    // open uploaded file
    csv.fromPath(req.file.path)
      .on("data", function (data) {
        fileRows.push(data); // push each row
      })
      .on("end", function () {
        console.log(fileRows);
        console.log('HELLO WORLD');
        fs.unlinkSync(req.file.path);   // remove temp file
        //process "fileRows" and respond
      })
  });

  module.exports = router;