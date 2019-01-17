// We’ll declare all our dependencies here
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

require('./api/config/passport');
const config = require('./api/config/database');
const users = require('./api/routes/users');
const index = require('./api/routes/index');

//Connect mongoose to our database
mongoose.connect(config.database, function(err){
    if(err){
        console.log("Not connected to database: "+err);
    }else{
        console.log("Successfully connected to MongoDB")
    }
});

//Declaring Port
const port = process.env.Port || 3000;

//Initialize our app variable
const app = express();

//Middleware for CORS
app.use(cors());

//Middlewares for bodyparsing using both json and urlencoding
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


/*express.static is a built in middleware function to serve static files.
 We are telling express server public folder is the place to look for the static files

*/
app.use(express.static(path.join(__dirname, 'public')));

//Express session and passport setup
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());

//Routing HTTP requests 
app.use('/', index);
app.use('/users', users);


//Listen to port 3000
app.listen(port, () => {
    console.log(`Starting the server at port ${port}`);
});