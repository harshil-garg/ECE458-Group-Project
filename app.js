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

const uploadroute = require('./api/routes/upload');
const exportroute = require('./api/routes/export');
const passport_config = require('./api/config/passport');
const mongoCreds = require('./api/config/database');
const elastic = require('./api/config/elasticsearch');
const users = require('./api/routes/user');
const ingredients = require('./api/routes/ingredient');
const skus = require('./api/routes/sku');
const product_lines = require('./api/routes/product_line');
const manufacturing_goals = require('./api/routes/manufacturing_goal');
const formulas = require('./api/routes/formula');
const manufacturing_lines = require('./api/routes/manufacturing_line');
const manufacturing_schedule = require('./api/routes/manufacturing_schedule');

//Connect mongoose to our database
mongoose.connect(mongoCreds.database, { useNewUrlParser: true }, function(err){
    if(err){
        console.log("Not connected to database: "+err);
    }else{
        console.log("Successfully connected to MongoDB")
    }
});

//index mongodb
// elastic.bulkIndex();


//Declaring Port
const port = process.env.Port || 3000;

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
/*express.static is a built in middleware function to serve static files.
 We are telling express server public folder is the place to look for the static files

*/
app.use(express.static(path.join(__dirname, 'public')));
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

//Create https server
let httpsServer = https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
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
