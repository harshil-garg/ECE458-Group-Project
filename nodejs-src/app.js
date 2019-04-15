const fs = require('fs');
const express = require('express');
const session = require('express-session');
const https = require('https');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const uploadroute = require('./routes/upload');
const exportroute = require('./routes/export');
require('./config/passport');
const mongo_config = require('./config/database');
const users = require('./routes/user');
const ingredients = require('./routes/ingredient');
const skus = require('./routes/sku');
const product_lines = require('./routes/product_line');
const manufacturing_goals = require('./routes/manufacturing_goal');
const formulas = require('./routes/formula');
const manufacturing_lines = require('./routes/manufacturing_line');
const manufacturing_schedule = require('./routes/manufacturing_schedule');
const manufacturing_schedule_automator = require('./routes/manufacturing_schedule_automator');
const sales_record = require('./routes/sales_record');
const customers = require('./routes/customer');
const jwt = require("jsonwebtoken");
const login = require('./routes/login')
//Connect mongoose to our database
mongoose.connect(mongo_config.uri, { useNewUrlParser: true }, function(err) {
    if (err) {
        console.log("Not connected to database: "+err);
    } else {
        console.log("Successfully connected to MongoDB")
	console.log(mongo_config.uri)
    }
});

//Declaring Port
const port = 3000;

//Initialize our app variable
const app = express();

//allows for documents to be uploaded in https
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

//Middleware for CORS
app.use(cors(corsOptions));

//Middlewares for bodyparsing using both json and urlencoding
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.use(passport.initialize());
// Routes
app.use('/api/login', login);
app.use('/api/upload', passport.authenticate('jwt', { session: false }), uploadroute);
app.use('/api/export', passport.authenticate('jwt', { session: false }), exportroute);
app.use('/api/ingredients', passport.authenticate('jwt', { session: false }), ingredients);
app.use('/api/skus', passport.authenticate('jwt', { session: false }), skus)
app.use('/api/product_lines', passport.authenticate('jwt', { session: false }), product_lines);
app.use('/api/users', passport.authenticate('jwt', { session: false }), users);
app.use('/api/manufacturing_goals', passport.authenticate('jwt', { session: false }), manufacturing_goals);
app.use('/api/formulas', passport.authenticate('jwt', { session: false }), formulas.router);
app.use('/api/manufacturing_lines', passport.authenticate('jwt', { session: false }), manufacturing_lines);
app.use('/api/manufacturing_schedule', passport.authenticate('jwt', { session: false }), manufacturing_schedule);
app.use('/api/manufacturing_schedule_automator', passport.authenticate('jwt', { session: false }), manufacturing_schedule_automator);
app.use('/api/sales_record', passport.authenticate('jwt', { session: false }),sales_record);
app.use('/api/customers', passport.authenticate('jwt', { session: false }), customers);

//Create https server
let httpsServer = https.createServer({
    key: fs.readFileSync('certificates/server.key'),
    cert: fs.readFileSync('certificates/server.cert')
  }, app);

//Listen to port 3000
httpsServer.listen(port, () => {
    console.log(`Starting the server at port ${port}`);
});