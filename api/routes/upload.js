const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const Validator = require('../model/ingredient_validation');
const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const csv = require('fast-csv');
const fs = require('fs');

let uploadSession = {
  started: false
}

router.post('/', upload.single('file'), function (req, res) {
    uploadSession.started = true;
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

      uploadSession.started = false;
      res.json({success: true, errorList: [], updateList: []});
  });

  module.exports = router;