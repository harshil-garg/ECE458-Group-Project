const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user');

const router = express.Router();

//Login page
router.get('/login', (req,res) => {
    res.send('login');
});

//Register page
router.get('/register', (req,res) => {
    res.send('register');
});

//Login handle


//Register handle
router.post('/register', (req,res) => {
    const {name, email, password, password2} = req.body;

    //check fields completed
    if(!name || !email || !password || !password2){
        res.send('Please fill in all fields');
    }

    //check passwords match
    if(password !== password2){
        res.send('Passwords do not match');
    }

    //validation passed
    let user = new User({
        name: name,
        email: email,
        password: password
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            user.password = hash;
        });
    }); 

    User.addUser(user, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to create a new user. Error: ${err}`});

        }else
            res.json({success:true, message: "Added successfully."});

    });
})

//Login handle
router.post('/login',
    passport.authenticate('local', { successRedirect: '/',
                                 failureRedirect: '/login' }));

module.exports = router;