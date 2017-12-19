// 微信配置
const wxConfig = {
    AppID: 'wx85ce1b78a4fa776b',
    AppSecret: '95930e3b8102de51cd97ed64cd426e23',
    token: 'wujinfeng2017',     // 公众号token
    accessTokenUrl: function () {
        return `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.AppID}&secret=${this.AppSecret}`
    }
};

module.exports = wxConfig;