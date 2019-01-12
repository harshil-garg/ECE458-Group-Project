// Well declare all our dependencies here
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

//Initialize our app variable
const app = express();

//Declaring Port
const port = 3000;

//Listen to port 3000
app.listen(port, () => {
    console.log(`Starting the server at port ${port}`);
});
