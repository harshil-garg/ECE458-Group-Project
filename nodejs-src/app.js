// We’ll declare all our dependencies here
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
const passport_config = require('./config/passport');
const mongo_config = require('./config/database');
const elastic = require('./config/elasticsearch');
const users = require('./routes/user');
const ingredients = require('./routes/ingredient');
const skus = require('./routes/sku');
const product_lines = require('./routes/product_line');
const manufacturing_goals = require('./routes/manufacturing_goal');
const formulas = require('./routes/formula');
const manufacturing_lines = require('./routes/manufacturing_line');
const manufacturing_schedule = require('./routes/manufacturing_schedule');
const sales_record = require('./routes/sales_record');
const customers = require('./routes/customer');

//Connect mongoose to our database
mongoose.connect(mongo_config.uri, { useNewUrlParser: true }, function(err) {
    if (err) {
        console.log("Not connected to database: "+err);
    } else {
        console.log("Successfully connected to MongoDB")
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

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/*', ensureAuthenticated);
app.use('/api/upload', uploadroute);
app.use('/api/export', exportroute);
app.use('/api/ingredients', ingredients);
app.use('/api/skus', skus)
app.use('/api/product_lines', product_lines);
app.use('/api/users', users);
app.use('/api/manufacturing_goals', manufacturing_goals);
app.use('/api/formulas', formulas.router);
app.use('/api/manufacturing_lines', manufacturing_lines);
app.use('/api/manufacturing_schedule', manufacturing_schedule);
app.use('/api/sales_record', sales_record);
app.use('/api/customers', customers);

//Create https server
let httpsServer = https.createServer({
    key: fs.readFileSync('certificates/server.key'),
    cert: fs.readFileSync('certificates/server.cert')
  }, app);

//Listen to port 3000
httpsServer.listen(port, () => {
    console.log(`Starting the server at port ${port}`);
});


function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated() || req.originalUrl === '/api/users/login'){
         return next();
    }
    res.redirect('/login');
}
