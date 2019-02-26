const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const mongo_config = require('./database');
const User = require('./user_model');
//Connect mongoose to our database
mongoose.connect(mongo_config.uri, { useNewUrlParser: true }, function(err) {
    if (err) {
        console.log("Not connected to database: "+err);
    } else {
        console.log("Successfully connected to MongoDB");
	let user = new User({
          name: 'Seeder Admin',
          email: 'admin458',
          password: 'hello',
          admin : true
        });
	
	bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, null, (err, hash) => {
            user.password = hash;
          });
        }); 

        User.createUser(user, (err) => {
          if(err) {
	    console.log("Failed to create a new user " + err);
          } else {
	    console.log("New seeded admin user has been created successfully!");
	  }
        });
    }
});
console.log("Hello");
