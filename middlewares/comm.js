const crypto = require('crypto');
const request = require('request');

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
                cb(null, obj);
            } catch (e) {
                cb(e);
            }
        } else {
            cb(response && response.statusCode);
        }
    });
};
// post请求 参数data是对象，返回body对象
let postRequest = function (url, data, cb) {
    request.post(url, {form: data}, function (error, response, body) {
        if (error) {
            return cb(error);
        }
        if (response && response.statusCode === 200) {
            try {
                let obj = JSON.parse(body);
                cb(null, obj);
            } catch (e) {
                cb(e);
            }
        } else {
            cb(response && response.statusCode);
        }
    });
};

// 接收流数据
let reqData = function (req, res, next) {
    let buffer = [];
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        buffer.push(chunk);
    });
    req.on('end', function () {
        req.body.reqStreamData = buffer.join();
        next();
    });
};


module.exports = {
    md5:md5,
    encrypt: encrypt,
    getSha1: getSha1,
    format: format,
    second2Time: second2Time,
    getRequest: getRequest,
    postRequest: postRequest,
    reqData: reqData,
};

