const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user');

const router = express.Router();

//Register page
router.get('/register', (req,res) => {
    res.send('register');
});

//Login page
router.get('/login', (req,res) => {
    res.send('login');
});

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
    passport.authenticate('local', { successRedirect: '/dashboard',
                                 failureRedirect: '/login' }));

//Logout Handle
router.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/');
});

//Get all users
let limit = 10;
router.post('/all/', (req, res) => {
    const { sortBy, pageNum } = req.body;

    //check fields completed
    if(!sortBy || !pageNum){
        res.send('Please fill in all fields');
    }

    User.find({}, null, {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, users) => {
        if((pageNum-1)*limit >= users.length){
            res.send('Page does not exist');
        }else{
            res.json({data: users});
        }
        
    });
        
});

module.exports = router;