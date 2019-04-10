const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user_model');
const autocomplete = require('../controllers/autocomplete');
const jwt = require("jsonwebtoken");
const router = express.Router();
const sessionTimeout = 6000000;
//Login handle
//request params: email, password
router.post('/',
    passport.authenticate('local', {session: false}), (req, res) => {
        let admin = false;
        User.findOne({email: req.body.email}, (err, user) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                analyst = user.analyst;
                product_manager = user.product_manager;
                business_manager = user.business_manager;
                plant_manager = user.plant_manager;
                admin = user.admin;
                const email = req.body.email;
                let d = new Date();
                let exp = d.getTime() + sessionTimeout;
                opts = {};
                const secret = 'SECRET_KEY'; //normally stored in process.env.secret
                const token = jwt.sign({ email, analyst, product_manager, business_manager, plant_manager, admin, exp }, secret, opts);
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
            user = new User({
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
                        admin = user.admin;
                        let d = new Date();
                        let exp = d.getTime() + sessionTimeout;
                        opts = {};
                        const secret = 'SECRET_KEY'; //normally stored in process.env.secret
                        const token = jwt.sign({ email: netid_email, admin, exp }, secret, opts);
                        res.json({success: true, token})
                    }
                });
        } else {
            admin = user.admin;
            let d = new Date();
            let exp = d.getTime() + sessionTimeout;
            opts = {};
            const secret = 'SECRET_KEY'; //normally stored in process.env.secret
            const token = jwt.sign({ email: netid_email, admin, exp }, secret, opts);
            res.json({success: true, token})
        }
        ;
        }
    });
});
module.exports = router;
