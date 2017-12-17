

//路由主入口
module.exports = function (app) {

    app.use('/gzh', require('./open'));
    app.use('/', require('./login'));

    // not found 404 page
    app.use(function (req, res) {
        if (!res.headersSent) {
            res.render('login', {errorMsg: ''});
        }
    });
};
