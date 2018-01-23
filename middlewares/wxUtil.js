const comm = require('./comm');
const fs = require('fs');
const path = require('path');
const request = require('request');
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
    } else if (resultXmlObj.Content === '3') {
        return messageImage(resultXmlObj);
    } else if (resultXmlObj.Content === '?' || resultXmlObj.Content === '？') {
        returnContent = '请回复1，2，3?';
    } else {
        returnContent = '请回复1，2，3?';
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

// 被动回复用户消息 回复图文消息
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


// 被动回复用户消息 回复图片消息
let messageImage = function (resultXmlObj) {
    let obj = {
        ToUserName: resultXmlObj.FromUserName,
        FromUserName: resultXmlObj.ToUserName,
        CreateTime: Math.round(new Date().getTime()/1000),
        MsgType: 'image',
        Image:{
            MediaId: '8d3qCFs_yHW__HDcZFS4hJLoQ6iRU5Et86X2cNcslvz28iJHvGcPtLMBOoPDPjFw'
        }
    };
    let builder = new xml2js.Builder({rootName: 'xml'});
    let xml = builder.buildObject(obj);
    return xml;
};


// 被动回复用户消息 回复语音消息
let messageVoice = function (resultXmlObj) {
    let obj = {
        ToUserName: resultXmlObj.FromUserName,
        FromUserName: resultXmlObj.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'voice',
        MediaId: ''
    };
    let builder = new xml2js.Builder({rootName: 'xml'});
    let xml = builder.buildObject(obj);
    return xml;
};

// 被动回复用户消息 回复音乐消息
let messageMusic = function (resultXmlObj) {
    let obj = {
        ToUserName: resultXmlObj.FromUserName,
        FromUserName: resultXmlObj.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'music',
        Music: {
            Title: '',
            Description: '',
            MusicURL: '',
            HQMusicUrl: '',
            ThumbMediaId: ''
        }
    };
    let builder = new xml2js.Builder({rootName: 'xml'});
    let xml = builder.buildObject(obj);
    return xml;
};

// 上传临时素材
let mediaUploadTemp = function () {
    let ACCESS_TOKEN = _accessToken.access_token;
    let data = '';
    let url = wxConfig.mediaUploadTemp + 'access_token=' + ACCESS_TOKEN + '&type=image';

    var formData = {
        // Pass a simple key-value pair
        my_field: 'my_value',
        // Pass data via Buffers
        my_buffer: new Buffer([1, 2, 3]),
        // Pass data via Streams
        my_file: fs.createReadStream(path.join(__dirname , '../public/img/imooc.png'))
    };
    request.post({url: url, formData: formData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });
};


// 组装 菜单
let initMenu = function () {
    let clickBtn11 = {
        "type":"click",
        "name":"今日歌曲",
        "key":"11"
    };
    let viewBtn21 = {
        "type":"view",
        "name":"vie搜索",
        "url":"http://www.soso.com/"
    };
    let clickBtn31 = {
        "type":"scancode_push",
        "name":"扫码事件",
        "key":"31",
    };
    let clickBtn32 = {
        "type":"location_select",
        "name":"地理位置",
        "key":"32",
    };
    let btn3 =  {
        "name":"菜单",
        "sub_button":[clickBtn31, clickBtn32]
    };

    let menu =  {
        "button":[clickBtn11,viewBtn21,btn3]
    };
    return menu;
};

let createMenu = function(token, menu){
    let url = wxConfig.createMenuURL+token;
    comm.postRequest(url, menu, (err, doc)=>{
        if(err){
            console.log('创建菜单出错');
            console.log(err);
        }else{
            if(doc.errcode === 0){
                console.log('创建菜单成功')
            }else{
                console.log('创建菜单失败'+doc.errcode+','+doc.errmsg);
            }
        }
    });
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
       // mediaUploadTemp();
        createMenu(_accessToken.access_token, initMenu())
    }
});


let myToken = function () {
    return _accessToken.access_token;
};





module.exports = {
    checkSignature: checkSignature,
    messageText: messageText,
    messageNews: messageNews,
    messageImage: messageImage,
    messageSubscribe: messageSubscribe,
    getAccessToken: myToken
};