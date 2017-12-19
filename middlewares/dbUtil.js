const pool = require('../lib/mysql');

//执行sql语句 param:{sql:'',option:''}
let execSql = function (param, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err);
        }
        if (param.option) {
            connection.query(param.sql, param.option, function (err, row) {
                connection.release();
                cb(err, row);
            });
        } else {
            connection.query(param.sql, function (err, row) {
                connection.release();
                cb(err, row);
            });
        }
    });
};


module.exports = {
    execSql: execSql
};