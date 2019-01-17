const express = require('express');
const router = express.Router();
const User = require('../model/user');
const bcrypt = require('bcrypt-nodejs');


router.post('/', (req,res) => {
    let newUser = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, null, (err, hash) => {
            newUser.password = hash;
        });
    }); 

    User.addUser(newUser, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to create a new user. Error: ${err}`});

        }else
            res.json({success:true, message: "Added successfully."});

    });
});

module.exports = router;