const path = require('path');
const moment = require('moment');
const mkdirp = require('mkdirp');
const winston = require('winston');
const DailyRotateFile=require('winston-daily-rotate-file');
const dateFormat=function() {
    return moment().format('YYYY-MM-DD HH:mm:ss:SSS');
};
const logDir='./logs/';                         //日志文件夹自动创建
mkdirp.sync(logDir);
var config = {
    port: 3032,                                  // 程序运行的端口
    proxy:'loopback, 127.0.0.1',                 //信任的代理ip
    debug: true,                                 // debug 为 true 时，用于本地调试，具体错误展示
    redis: {
        host: '192.168.1.117',
        db: 6,
        port: 6379,
        passwd: '123'
    },
    mysql: {
        host: '127.0.0.1',
        user: 'root',
        port: 3306,
        password: '1234',
        database: 'test'
    },

    logger: new (winston.Logger)({
        transports: [
            new DailyRotateFile({
                name: 'info-file',
                filename: path.join(logDir, 'info.log'),
                level: 'info',
                timestamp: dateFormat,
                localTime: true,
                maxsize: 1024*1024*10,
                datePattern:'.yyyy-MM-dd'
            }),
            new DailyRotateFile({
                name: 'error-file',
                filename: path.join(logDir, 'error.log'),
                level: 'error',
                timestamp: dateFormat,
                localTime: true,
                maxsize: 1024*1024*10,
                datePattern:'.yyyy-MM-dd'
            })
        ]
    })
};

//崩溃日志
winston.handleExceptions(new winston.transports.File({
    filename: path.join(logDir, 'crash.log'),
    handleExceptions: true,
    timestamp:dateFormat,
    humanReadableUnhandledException: true,
    json: false
}));

module.exports = config;
