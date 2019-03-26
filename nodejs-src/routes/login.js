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
module.exports = router;
