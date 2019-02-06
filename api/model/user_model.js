//Require mongoose package
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true
    }
});


module.exports = mongoose.model('User', UserSchema);

//newUser.save is used to insert the document into MongoDB
module.exports.createUser = (newUser, callback) => {
    newUser.save(callback);
}