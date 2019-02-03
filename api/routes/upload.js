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

router.post('/', upload.array('file[]', 4), function (req, res) {
    uploadSession.started = true;
    
  
    // open uploaded file
    req.files.forEach(file => {
      const fileRows = [];
      csv.fromPath(file.path, {headers: true})
      .on("data", function (data) {
        fileRows.push(data); // push each row
      })
      .on("end", function () {
        console.log(fileRows);
        fs.unlinkSync(file.path);   // remove temp file
      })
    })

      res.json({success: true, errorList: []});
  });
  //This will be called when we have an array of files.
  function handleFiles() {

  }

  module.exports = router;