let express = require('express');
let router = express.Router();
let config = require('../config/config');
let comm = require('../middlewares/comm');
let logger = config.logger;

router.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

// get 主页
router.get('/', function (req, res) {
    res.render('index');
});



module.exports = router;