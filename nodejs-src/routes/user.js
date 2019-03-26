const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user_model');
const autocomplete = require('../controllers/autocomplete');
const jwt = require("jsonwebtoken");
const router = express.Router();

//Autcomplete
router.post('/autocomplete', async (req, res) => {    
    let results = await autocomplete.email(User, req.body.query);
    res.json({success: true, data: results});
});

router.post('/update-priveleges', async (req, res) => {    
    User.findOne({email: req.body.email}, (err, result) =>{
        if (!result) {
            res.json({success: false, message: 'User not found'});
        }
        else if (err) {
            res.json({success: false, message: err});
        }
        else if (result.admin == req.body.admin){
            res.json({success: false, message: `User is already ${result.admin ? 'admin' : 'not an admin'}`});
        }
        else {
            User.findOneAndUpdate({email: req.body.email}, {admin: req.body.admin}, (err, result) => {
                if (err) {
                    res.json({success: false, message: err});
                }
                else res.json({success: true, message: 'Updated user admin permissions succesfully'});
            });
        }
    });
});

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

router.post('/netid', (req, res) => {
    const {name, email} = req.body;
    var netid_email = "netid_"+email;
    User.findOne({email: netid_email}, (err, user) => {
	    if (err) {
		res.json({success: false, message: `Failed to create a new user. Error: ${err}`});
            	console.log(err);
	    } else {
		if (!user) {
			let user = new User({
        			name: name,
			        email: netid_email,
			        password: "hello",
        			admin : false
    			});

    			bcrypt.genSalt(10, (err, salt) => {
        			bcrypt.hash(user.password, salt, null, (err, hash) => {
            				user.password = hash;
        			});
    			});

    			User.createUser(user, (err) => {
        			if (err) {
            				res.json({success: false, message: `Failed to create a new user. Error: ${err}`});
        			} else {
					req.url = "/login";
					req.body.email = netid_email;
					req.body.password = "hello";
				        router.handle(req, res);
				}
    			});
		} else {
			req.url = "/login";
			req.body.email = netid_email;
			req.body.password = "hello";
			router.handle(req, res);
		}
	    }
    });
});

//Logout Handle
router.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login');
});


module.exports = router;
