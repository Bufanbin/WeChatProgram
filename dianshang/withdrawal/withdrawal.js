var app = getApp();
var withtype;
Page({
    data: {
        loaded: false,
        wechat_pay: 0,
        alipay: 0,
        card_one: 0,
        card_two: 0
    },
    onLoad: function (e) {
        app.addIplog();
        withtype = e.withtype;
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var title = '佣金提现';
        var url = '';
        if (withtype == 1) {
            url = '/disweb/cashSet';
        } else if (withtype == 2) {
            url = '/newapp/cashSet';
        } else if (withtype == 3) {
            title = '提现申请';
            url = '/city/cashSet';
        }
        app.setPageTitle(title);
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                var newdata = {};
                var cashset = res.cashset;
                newdata['wechat_pay'] = cashset.wechat_pay;
                newdata['alipay'] = cashset.alipay;
                newdata['card_one'] = cashset.card_one;
                newdata['loaded'] = true;
                that.setData(newdata);
            }
        })
    },
    goToWechatCash: function (e) {
        var url = '/dianshang/wechatCash/wechatCash?cash_mode=0&withtype=' + withtype;
        app.turnToPage(url);
    },
    goToAlipayCash: function (e) {
        var url = '/dianshang/wechatCash/wechatCash?cash_mode=1&withtype=' + withtype;
        app.turnToPage(url);
    },
    goToBankcardCash: function (e) {
        var url = '';
        if (withtype != 3) {
            url = '/dianshang/bankcardCash/bankcardCash?withtype=' + withtype;
        } else {
            url = '/tongcheng/applicationCash/applicationCash';
        }
        app.turnToPage(url);
    }
})