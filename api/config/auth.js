module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/users/login');
        res.send('Please log in first');
    }
}