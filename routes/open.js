let express = require('express');
let router = express.Router();
let config = require('../config/config');
let comm = require('../middlewares/comm');
let logger = config.logger;
let xml2js = require('xml2js');

router.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

const MESSAGE_TEXT = 'text';
const MESSAGE_IMAGE = 'image';
const MESSAGE_VOICE = 'voice';
const MESSAGE_VIDEO = 'video';
const MESSAGE_SHORTVIDEO = 'shortvideo';
const MESSAGE_LOCATION = 'location';
const MESSAGE_LINK = 'link';
const MESSAGE_EVENT = 'event';
const MESSAGE_EVENT_SUBSCRIBE = 'subscribe';  // 1.用户未关注时，进行关注后的事件推送
const MESSAGE_EVENT_SCAN = 'SCAN';            // 2.用户已关注时的事件推送
const MESSAGE_EVENT_UNSUBSCRIBE = 'unsubscribe'; // 取消订阅
const MESSAGE_EVENT_LOCATION = 'LOCATION';  // 上报地理位置事件
const MESSAGE_EVENT_CLICK = 'CLICK';        // 点击菜单拉取消息时的事件推送
const MESSAGE_EVENT_VIEW = 'VIEW';          // 点击菜单跳转链接时的事件推送


/**
 * 开启公众号开发者模式
 */

// get
router.get('/open', function (req, res) {
    let signature = req.query.signature;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;
    let echostr = req.query.echostr;

    if(comm.checkSignature(signature,timestamp,nonce)){
        res.send(echostr);
    }else{
        res.send('error');
    }
});

// post
router.post('/open', function (req, res) {
    console.log('post /open');
    let buffer = [];
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        buffer.push(chunk);
    });
    req.on('end', function () {
        let xmlStr = buffer.join();
        xml2js.parseString(xmlStr, {explicitArray : false}, function (err, result) {
            if(err){
                return res.send('success');  // 假如服务器无法保证在五秒内处理回复，则必须回复“success”或者“”（空串），否则微信后台会发起三次重试。
            }
            let resultXmlObj = result.xml;
            if (resultXmlObj.MsgType === 'text') {
                let returnContent = resultXmlObj.Content;
                if(resultXmlObj.Content === '1'){
                    returnContent = '你好';
                }else if(resultXmlObj.Content === '2'){
                    returnContent = '吃饭了吗？';
                }else if(resultXmlObj.Content === '?' || resultXmlObj.Content === '？'){
                    returnContent = '请回复1，2，?';
                }else{
                    returnContent = '请回复1，2，?';
                }
                let obj = {
                    ToUserName: resultXmlObj.FromUserName,
                    FromUserName: resultXmlObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: 'text',
                    Content: returnContent
                };
                let builder = new xml2js.Builder({rootName:'xml'});
                let xml = builder.buildObject(obj);
                console.log(xml)
                res.send(xml);
            } else if(resultXmlObj.MsgType === MESSAGE_EVENT) {
                if (resultXmlObj.Event = MESSAGE_EVENT_SUBSCRIBE){
                    let obj = {
                        ToUserName: resultXmlObj.FromUserName,
                        FromUserName: resultXmlObj.ToUserName,
                        CreateTime: new Date().getTime(),
                        MsgType: MESSAGE_TEXT,
                        Content: '欢迎关注我'
                    };
                    let builder = new xml2js.Builder({rootName:'xml'});
                    let xml = builder.buildObject(obj);
                    console.log(xml);
                    res.send(xml);
                }else {
                    res.send('success');
                }

            } else {
                res.send('success');
            }
        });
    });
});


module.exports = router;