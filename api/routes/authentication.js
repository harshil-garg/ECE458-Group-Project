const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user_model');

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
//request params: name, email, password, password2
router.post('/register', (req,res) => {
    const {name, email, password, password2, admin} = req.body;

    //check fields completed
    if(!name || !email || !password || !password2){
        res.send('Please fill in all fields');
        return;
    }

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

    User.addUser(user, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to create a new user. Error: ${err}`});

        }else
            res.json({success:true, message: "Added successfully."});

    });

})

//Login handle
//request params: email, password
router.post('/login',
    passport.authenticate('local'), (req, res) => {
        let admin;
        User.findOne({email: req.body.email}, (err, user) => {
            admin = user.admin;
        });
		res.json({success: true, message: "worked", admin: admin});
	});

//Logout Handle
router.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login');
});

//Get all users
//request params: sortBy, pageNum
let limit = 10;
router.post('/all/', (req, res) => {
    if (req.isAuthenticated()) {
        const { sortBy, pageNum } = req.body;

        //check fields completed
        if(!sortBy || !pageNum){
            res.send('Please fill in all fields');

            return;
        }

        User.find({}, null, {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, users) => {
            if((pageNum-1)*limit >= users.length){
                res.send('Page does not exist');
            }else{
                res.json({data: users});
            }
            
        });
    }
    else {
        res.redirect('/users/login');
    }   
});



module.exports = router;