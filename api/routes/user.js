const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user_model');
const input_validator = require('../controllers/input_validation');

const router = express.Router();

//Register page
router.get('/register', (req,res) => {
    res.send('register');
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

//Login handle
//request params: email, password
router.post('/login',
    passport.authenticate('local'), (req, res) => {
        let admin = false;
        User.findOne({email: req.body.email}, (err, user) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                admin = user.admin;
                res.json({success: true, message: "worked", admin: admin});
            }
            
        });
		
	});

//Logout Handle
router.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login');
});


module.exports = router;