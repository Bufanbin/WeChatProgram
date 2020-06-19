var app = getApp();
var withtype;
Page({
    data: {
        loaded: false,
        cash_mode: 0,
        showTip: false,
        balance: 0,
        cashmoney: '',
        old_cashmoney: '',
        tipText: '',
        account_number: '',
        account_name: ''
    },
    onLoad: function (e) {
        app.addIplog();
        app.setPageUserInfo();
        var cash_mode = e.cash_mode;
        withtype = e.withtype;
        var account_number = '';
        var account_name = '';
        if (cash_mode == 0) {
            wx.setNavigationBarTitle({
                title: '提现到微信'
            });
            account_number = wx.getStorageSync('wechat_number') || '';
            account_name = wx.getStorageSync('wechat_name') || '';
        } else {
            wx.setNavigationBarTitle({
                title: '提现到支付宝'
            });
            account_number = wx.getStorageSync('alipay_number') || '';
            account_name = wx.getStorageSync('alipay_name') || '';
        }
        this.setData({
            account_number: account_number,
            account_name: account_name,
            cash_mode: cash_mode,
            withtype: withtype
        })
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var url = '';
        if (withtype == 1) {
            url = '/disweb/balance';
        } else if (withtype == 2) {
            url = '/newapp/balance';
        } else if (withtype == 3) {
            url = '/city/initWithTable';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    newdata['balance'] = res.balance;
                    newdata['loaded'] = true;
                    that.setData(newdata);
                }
            }
        })
    },
    enterInput: function (e) {
        var value = e.detail.value;
        var type = app.getset(e).type;
        if (type == 'money') {
            var reg = /^(0|[1-9]\d*)(\.\d{0,2})?$/;
            if (value && !reg.test(value)) {
                var old_cashmoney = this.data.old_cashmoney;
                this.setData({
                    cashmoney: old_cashmoney
                })
            } else {
                this.setData({
                    old_cashmoney: value
                })
            }
        } else if (type == 'account') {
            this.setData({
                account_number: value
            })
        } else if (type == 'name') {
            this.setData({
                account_name: value
            })
        }
    },
    submitApply: function (e) {
        var openid = app.getSessionKey();
        var value = e.detail.value;
        var money = value.money;
        if (!money) {
            app.openTip('请输入提现金额');
            return false;
        }
        var balance = this.data.balance;
        if (parseFloat(money) > parseFloat(balance)) {
            app.openTip('提现金额不能大于可提现金额');
            return false;
        }
        var account_number = value.account_number;
        if (!account_number) {
            var text = '请输入微信号';
            if (this.data.cash_mode == 1) {
                text = '请输入支付宝账号';
            }
            app.openTip(text);
            return false;
        }
        var name = value.name;
        if (!name) {
            app.openTip('请输入收款人姓名');
            return false;
        }
        var nickname = this.data.userInfo.nickName;
        var cash_mode = this.data.cash_mode;
        var url = '';
        if (withtype == 1) {
            url = '/disweb/cash';
        } else if (withtype == 2) {
            url = '/newapp/cash';
        } else if (withtype == 3) {
            url = '/city/cash';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                openid: openid,
                money: money,
                account_number: account_number,
                nickname: nickname,
                cash_mode: cash_mode,
                name: name
            },
            success: function (res) {
                if (res.code == 1) {
                    if (cash_mode == 0) {
                        wx.setStorage({
                            key: 'wechat_number',
                            data: account_number
                        })
                        wx.setStorage({
                            key: 'wechat_name',
                            data: name
                        })
                    } else {
                        wx.setStorage({
                            key: 'alipay_number',
                            data: account_number
                        })
                        wx.setStorage({
                            key: 'alipay_name',
                            data: name
                        })
                    }
                    app.openTip('提现申请成功！请等待审核...');
                    setTimeout(function () {
                        app.turnBack();
                    }, 2000);
                } else {
                    app.openTip(res.msg);
                }
            }
        })
    }
})