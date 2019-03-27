const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user_model');
const autocomplete = require('../controllers/autocomplete');
const jwt = require("jsonwebtoken");
const router = express.Router();
//Login handle
//request params: email, password
router.post('/',
    passport.authenticate('local', {session: false}), (req, res) => {
        let admin = false;
        User.findOne({email: req.body.email}, (err, user) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                admin = user.admin;
                const email = req.body.email;
                let d = new Date();
                let exp = d.getTime() + 600000;
                opts = {};
                const secret = 'SECRET_KEY'; //normally stored in process.env.secret
                const token = jwt.sign({ email, admin, exp }, secret, opts);
                res.json({success: true, token});
            }
            
        });
		
    });

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
module.exports = router;
