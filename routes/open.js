let express = require('express');
let router = express.Router();
let config = require('../config/config');
let comm = require('../middlewares/comm');
let wxUtil = require('../middlewares/wxUtil');
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
const MESSAGE_EVENT_SCANCODE = 'scancode_push'; // 扫码事件

/**
 * 开启公众号开发者模式
 */

// get
router.get('/open', function (req, res) {
    let signature = req.query.signature;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;
    let echostr = req.query.echostr;

    if (wxUtil.checkSignature(signature, timestamp, nonce)) {
        res.send(echostr);
    } else {
        res.send('error');
    }
});

// post
router.post('/open', comm.reqData, function (req, res, next) {
    console.log('post /open');
    let xmlStr = req.body.reqStreamData;
    console.log(xmlStr);
    xml2js.parseString(xmlStr, {explicitArray: false}, function (err, result) {
        if (err) {
            return res.send('success');  // 假如服务器无法保证在五秒内处理回复，则必须回复“success”或者“”（空串），否则微信后台会发起三次重试。
        }
        let resultXmlObj = result.xml;
        if (resultXmlObj.MsgType === MESSAGE_TEXT) {
            let returnXMl = wxUtil.messageText(resultXmlObj);
            console.log(returnXMl);
            res.send(returnXMl);
        } else if (resultXmlObj.MsgType === MESSAGE_EVENT) {
            let eventType = resultXmlObj.Event;
            if (eventType === MESSAGE_EVENT_SUBSCRIBE) {
                let returnXMl = wxUtil.messageSubscribe(resultXmlObj);
                console.log(returnXMl);
                res.send(returnXMl);
            } else if (eventType === MESSAGE_EVENT_CLICK) {
                let returnXMl = wxUtil.messageText(resultXmlObj);
                console.log(returnXMl);
                res.send(returnXMl);
            } else if (eventType === MESSAGE_EVENT_VIEW) {
                let url = resultXmlObj['EventKey'];
                let returnXMl = wxUtil.messageView(resultXmlObj, url);
                console.log(returnXMl);
                res.send(returnXMl);
            } else if (eventType === MESSAGE_EVENT_SCANCODE) {
                let key = resultXmlObj.get['EventKey'];
                let returnXMl = wxUtil.messageScancode(resultXmlObj, key);
                console.log(returnXMl);
                res.send(returnXMl);
            } else {
                res.send('success');
            }
        } else if (resultXmlObj.MsgType === MESSAGE_LOCATION) {
            let label = resultXmlObj['Label'];
            let returnXMl = wxUtil.messageLocation(resultXmlObj, label);
            console.log(returnXMl);
            res.send(returnXMl);
        }else {
            res.send('success');
        }
    });
});


module.exports = router;