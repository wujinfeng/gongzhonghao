const crypto = require('crypto');
const request = require('request');
const pool = require('../lib/mysql');

//md5加密
let md5 = function (text) {
    return crypto.createHash('md5').update(text).digest('hex')
};
let getSha1 = function (text) {
    return crypto.createHash('sha1').update(text).digest('hex')
};
//加密
let encrypt = function (text) {
    return md5(md5(text));
};
// 格式2位数字
let format = function (param) {
    return (parseInt(param) < 10) ? '0' + param : param;
};

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

// 秒转时间
let second2Time = function (second) {
    let s = parseInt(second);
    let t = '00:00:00';
    if (s > 0) {
        let hour = parseInt(s / 3600);
        let min = parseInt(s / 60) % 60;
        let sec = s % 60;
        t = '' + format(hour) + ':' + format(min) + ':' + format(sec);
    }
    return t;
};

// 参数data是对象key:value，返回body对象
let getRequest = function (url, cb) {
    request.get(url, function (error, response, body) {
        if (error) {
            return cb(error);
        }
        if (response && response.statusCode === 200) {
            try {
                let obj = JSON.parse(body);
                if (obj.code === 200 || obj.code === 204) {
                    cb(null, obj);
                } else {
                    cb(obj.code + ',' + obj.msg);
                }
            } catch (e) {
                cb(e);
            }
        } else {
            cb(response);
        }
    });
};

let checkSignature = function(signature, timestamp, nonce){
    let token = 'wujinfeng2017';
    let arr = [token, timestamp, nonce];
    console.log('arr1:'+arr)
    arr.sort();
    console.log('arr2:'+arr)
    let content = arr.join('');
    console.log('content:'+content)
    let temp = getSha1(content);
    return temp === signature;
};


//导出
module.exports = {
    encrypt: encrypt,
    format: format,
    second2Time: second2Time,
    execSql: execSql,
    getRequest: getRequest,
    checkSignature: checkSignature
};

