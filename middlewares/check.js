const config = require('../config/config');
const logger = config.logger;


let checkLogin = function (req, res, next) {
    next();
};

//导出函数
module.exports = {
    checkLogin: checkLogin
};