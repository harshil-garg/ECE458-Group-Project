// We’ll declare all our dependencies here
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const csv = require('fast-csv');
const session = require('express-session');
const https = require('https');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

require('./api/config/passport');
const config = require('./api/config/database');
const users = require('./api/routes/authentication');
const ingredients = require('./api/routes/ingredient');
const index = require('./api/routes/index');

const router = express.Router();

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


/*express.static is a built in middleware function to serve static files.
 We are telling express server public folder is the place to look for the static files

*/
app.use(express.static(path.join(__dirname, 'public')));

//Uploading csv files
//app.post('/upload', upload);

router.post('/', upload.single('file'), function (req, res) {
  const fileRows = [];

  // open uploaded file
  csv.fromPath(req.file.path)
    .on("data", function (data) {
      fileRows.push(data); // push each row
    })
    .on("end", function () {
      console.log(fileRows);
      console.log('HELLO WORLD');
      fs.unlinkSync(req.file.path);   // remove temp file
      //process "fileRows" and respond
    })
});

app.use('/upload', router);

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
app.use('/api/ingredients', ingredients);
app.use('/api/users', users);
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
