const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const autocomplete = require('../controllers/autocomplete');
const jwt = require("jsonwebtoken");
const router = express.Router();

//Autcomplete
router.post('/autocomplete', async (req, res) => {    
    let results = await autocomplete.email(User, req.body.query);
    res.json({success: true, data: results});
});

router.post('/update-priveleges', async (req, res) => {    
    const {email, admin, product_manager, business_manager, manufacturing_lines, analyst} = req.body;

    if (email == req.user.email) {
        res.json({success: false, message: "A user can't update their own priveleges"})
        return
    }
    User.findOne({email: email}, async (err, result) =>{
        if (!result) {
            res.json({success: false, message: 'User not found'});
        }
        else if (err) {
            res.json({success: false, message: err});
        }
        else {
            let line_ids = [];
            let error;

            for(let line of manufacturing_lines){
                let line_model = await ManufacturingLine.findOne({shortname: line}).exec();
                if(!line_model){
                    error = line;
                    break;
                }
                line_ids.push(line_model._id);
            }
            if(error){
                res.json({success: false, message: `Invalid manufacturing line: ${error}`})
            }else{
                let json = {
                    admin: admin,
                    product_manager: product_manager,
                    business_manager: business_manager,
                    plant_manager: line_ids,
                    analyst: analyst
                }
                User.findOneAndUpdate({email: email}, json, (err, result) => {
                    if (err) {
                        res.json({success: false, message: err});
                    }
                    else res.json({success: true, message: 'Updated user roles succesfully'});
                });
            }
            
        }
    });
});

router.post('/get-priveleges', async (req, res) => {
    const {email} = req.body;

    let cursor = await User.aggregate([]).match({email: email}).lookup({
        from: 'manufacturinglines',
        localField: 'plant_manager',
        foreignField: '_id',
        as: 'plant_manager'
    }).cursor({}).exec();

    let results = [];
    await cursor.eachAsync((res) => {
        results.push(res);
    });

    if(results.length == 0){
        res.json({success: false, message: 'No user by that email'})
    }else{
        res.json({success: true, data: results})
    }
})

router.post('/delete-user', async (req, res) => {    
    User.findOne({email: req.body.email}, (err, result) =>{
        if (!result) {
            res.json({success: false, message: 'User not found'});
        }
        else if (err) {
            res.json({success: false, message: err});
        }
        else {
            User.findOneAndRemove({email: req.body.email},(err, result) => {
                if (err) {
                    res.json({success: false, message: err});
                }
                else res.json({success: true, message: 'Deleted user succesfully'});
            });
        }
    });
});

//Register handle
//request params: name, email, password, password2
router.post('/register', (req,res) => {
    const {name, email, password, password2, admin} = req.body;


    //check passwords match
    if(password !== password2){
        res.send('Passwords do not match');
        return;
    }
    
    //validation passed
    let user = new User({
        name: name,
        email: email,
        password: password,
        admin : admin
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            user.password = hash;
        });
    }); 

    User.createUser(user, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to create a new user. Error: ${err}`});

        }else
            res.json({success:true, message: "Added successfully."});

    });

})

router.get('/get', async (req, res) => {
    let users = await User.find();
    let emails = users.map(user => user.email);
    res.send(emails);
})

module.exports = router;
