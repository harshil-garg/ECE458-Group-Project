const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user')

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    //Match user
    User.findOne({email: email})
        .then((user) => {
            if(!user){
                console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
                return done(null, false, {message: 'Email not registered'});
            }

            //Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;

                if(isMatch){
                    return done(null, user);
                }else{
                    return done(null, false, {message: 'Password is incorrect'});
                }
            });
        })
        .catch((err) => console.log(err));
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});