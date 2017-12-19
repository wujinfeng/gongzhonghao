# gongzhonghao
微信公众号

在config添加微信配置文件 wxConfig.js

-// 微信配置
 -const wxConfig = {
 -    AppID: 'dfgdfgd',
 -    AppSecret: 'dfgdfgd23',
 -    token: 'wujinfeng',     // 公众号token
 -    accessTokenUrl: function () {
 -        return `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.AppID}&secret=${this.AppSecret}`
 -    }
 -};
 -
 -module.exports = wxConfig; 
