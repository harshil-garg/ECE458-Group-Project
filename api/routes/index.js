const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

router.get('/', (req,res) => {
    res.send('Hello');
})

router.get('/dashboard', ensureAuthenticated, (req,res) => {
    res.send('Dashboard');
})

module.exports = router;