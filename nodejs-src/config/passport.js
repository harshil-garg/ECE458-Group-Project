const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const User = require('../model/user_model')

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    //Match user
    User.findOne({email: email})
        .then((user) => {
            if(!user){
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
    done(null, user._id);
});
  
passport.deserializeUser(function(_id, done) {
    User.findOne({_id: _id}).then((user) => {
        return done(null, user);
    })
    .catch((err) => console.log(err));
});

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'SECRET_KEY'; //normally store this in process.env.secret

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({email: jwt_payload.email}).exec()
        .then((user, err) => {
            if (user) {
                return done(null, user);
            }
            else {
                console.log('no one found');
                return done(null, false);
            }
        });
}));