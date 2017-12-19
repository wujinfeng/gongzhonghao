const comm = require('./comm');
const logger = require('../config/config').logger;
const xml2js = require('xml2js');
const wxConfig = require('../config/wxConfig');

let _accessToken = {
    access_token: '',
    expires_in: 7200
};

// 签名验证
let checkSignature = function (signature, timestamp, nonce) {
    let arr = [wxConfig.token, timestamp, nonce];
    arr.sort();
    let content = arr.join('');
    let temp = comm.getSha1(content);
    return temp === signature;
};

// 文本消息
let messageText = function (resultXmlObj) {
    let returnContent = resultXmlObj.Content;
    if (resultXmlObj.Content === '1') {
        returnContent = '你好';
    } else if (resultXmlObj.Content === '2') {
        return messageNews(resultXmlObj);
    } else if (resultXmlObj.Content === '?' || resultXmlObj.Content === '？') {
        returnContent = '请回复1，2，?';
    } else {
        returnContent = '请回复1，2，?';
    }
    let obj = {
        ToUserName: resultXmlObj.FromUserName,
        FromUserName: resultXmlObj.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: returnContent
    };
    let builder = new xml2js.Builder({rootName: 'xml'});
    let xml = builder.buildObject(obj);
    return xml;
};

// 第一次订阅消息
let messageSubscribe = function (resultXmlObj) {
    let obj = {
        ToUserName: resultXmlObj.FromUserName,
        FromUserName: resultXmlObj.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: '欢迎关注我'
    };
    let builder = new xml2js.Builder({rootName: 'xml'});
    let xml = builder.buildObject(obj);
    return xml;
};

// 回复图文消息
let messageNews = function (resultXmlObj) {
    let item = {
        Title: '标题',
        Description: '描述',
        PicUrl: 'http://img05.tooopen.com/images/20140326/sy_57640132134.jpg',
        Url: 'http://baidu.com',
    };
    let itemArr = [item, item, item];
    let obj = {
        ToUserName: resultXmlObj.FromUserName,
        FromUserName: resultXmlObj.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'news',
        ArticleCount: itemArr.length,
        Articles: {item: itemArr}
    };
    let builder = new xml2js.Builder({rootName: 'xml'});
    let xml = builder.buildObject(obj);
    return xml;
};

// 获取access_token
let _getAccessToken = function (cb) {
    comm.getRequest(wxConfig.accessTokenUrl(), function (err, obj) {
        if (err) {
            return cb(err);
        }
        if (obj.access_token) {
            cb(null, obj);
        } else {
            cb(new Error(obj.errcode + obj.errmsg));
        }
    });
};

// 刷新
function _refreshAccessToken() {
    _getAccessToken((err, obj) => {
        if (err) {
            console.error('刷新accessToken出错');
            logger.error(err);
        } else {
            _accessToken = obj;
            logger.info('刷新_accessToken:ok');
            _timeoutRefresh();
        }
    });
}

// 超时刷新
function _timeoutRefresh() {
    setTimeout(function () {
        _refreshAccessToken();
    }, (_accessToken.expires_in - 200) * 1000)
}


// 程序启动获取access_token
_getAccessToken((err, obj) => {
    if (err) {
        process.exit('程序启动获取access_token出错');
    } else {
        _accessToken = obj;
        logger.info('程序启动获取_accessToken:ok');
        _timeoutRefresh();
    }
});


let myToken = function () {
    return _accessToken.access_token;
};

module.exports = {
    checkSignature: checkSignature,
    messageText: messageText,
    messageNews: messageNews,
    messageSubscribe: messageSubscribe,
    getAccessToken: myToken
};