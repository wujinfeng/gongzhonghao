var config = require('../config/config');
var mysql = require('mysql');
var pool = mysql.createPool({
        host: config.mysql.host,
        user: config.mysql.user,
        port: config.mysql.port,
        password: config.mysql.password,
        database: config.mysql.database
});

//尝试连接是否成功
pool.getConnection(function (err, connection) {
    if (err) {
        console.log('connect mysql err');
        console.log(err);
        process.exit(1);
        return;
    }
    console.log('connect mysql ok.');
    connection.release();
});

module.exports = pool;
