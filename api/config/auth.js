function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated() || req.originalUrl === '/api/users/login'){
         return next();
    }
    res.redirect('/login');
}

module.exports = ensureAuthenticated;
