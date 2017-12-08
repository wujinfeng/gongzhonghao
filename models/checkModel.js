var comm = require('../middlewares/comm');
var config = require('../config/config');

class Check {

    //通过输入的网址url查询到系统名字name
    getSystemName(url, cb) {
        comm.execSql({sql: 'select 1+1', option: ''}, cb);
    }

}

module.exports = Check;