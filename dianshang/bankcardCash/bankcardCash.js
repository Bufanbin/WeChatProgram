var app = getApp();
var withtype;
Page({
    data: {
        loaded: false,
        showTip: false,
        openBank: ['中国工商银行', '中国农业银行', '中国银行', '中国建设银行', '中国招商银行', '中国储蓄银行', '中国交通银行', '中国浦发银行', '中国兴业银行', '中国民生银行', '中国平安银行', '中国中信银行', '中国华夏银行', '中国广发银行', '中国光大银行', '中国北京银行', '中国宁波银行'],
        bankIdx: -1,
        balance: 0,
        cashmoney: '',
        old_cashmoney: '',
        poundage: 1.0,
        tipText: '',
        account_number: '',
        account_name: ''
    },
    onLoad: function (e) {
        app.addIplog();
        app.setPageUserInfo();
        withtype = e.withtype;
        var account_number = wx.getStorageSync('bank_number') || '';
        var account_name = wx.getStorageSync('bank_name') || '';
        var bankIdx = wx.getStorageSync('bank_idx') || -1;
        this.setData({
            account_number: account_number,
            account_name: account_name,
            bankIdx: bankIdx
        })
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var url = '';
        if (withtype == 1) {
            url = '/disweb/balance';
        } else {
            url = '/newapp/balance';
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
    bindBank: function (e) {
        var val = e.detail.value;
        this.setData({
            bankIdx: val
        })
    },
    enterInput: function (e) {
        var reg = /^(0|[1-9]\d*)(\.\d{0,2})?$/;
        var value = e.detail.value;
        if (value && !reg.test(value)) {
            var old_cashmoney = this.data.old_cashmoney;
            this.setData({
                cashmoney: old_cashmoney
            })
        } else {
            var poundage = 1.0;
            if (value) {
                poundage = (parseFloat(value) * 0.01).toFixed(2);
                if (poundage < 1.0) {
                    poundage = 1.0;
                }
                if (poundage > 25.0) {
                    poundage = 25.0;
                }
            }
            this.setData({
                old_cashmoney: value,
                poundage: poundage
            })
        }
    },
    submitApply: function (e) {
        var openid = app.getSessionKey();
        var value = e.detail.value;
        var name = value.name;
        if (!name) {
            app.openTip('请填写您的户名');
            return false;
        }
        var account_number = value.account_number;
        if (!account_number) {
            app.openTip('请填写借记卡卡号');
            return false;
        }
        var reg = /^([1-9]{1})(\d{14}|\d{18})$/;
        if (!reg.test(account_number)) {
            app.openTip('请填写正确的借记卡卡号');
            return false;
        }
        var bankIdx = this.data.bankIdx;
        if (bankIdx == -1) {
            app.openTip('请选择对应的开户行');
            return false;
        }
        var bank_type = this.data.openBank[bankIdx];
        var money = value.money;
        if (!money) {
            app.openTip('请输入提现金额');
            return false;
        }
        var poundage = value.poundage;
        var balance = this.data.balance;
        if (parseFloat(money) + parseFloat(poundage) > parseFloat(balance)) {
            app.openTip('“提现金额+手续费”不能大于可提现金额');
            return false;
        }
        var nickname = this.data.userInfo.nickName;
        var url = '';
        if (withtype == 1) {
            url = '/disweb/cashBankcard';
        } else {
            url = '/newapp/cashBankcard';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                openid: openid,
                name: name,
                account_number: account_number,
                bank_type: bank_type,
                money: money,
                poundage: poundage,
                nickname: nickname
            },
            success: function (res) {
                if (res.code == 1) {
                    wx.setStorage({
                        key: 'bank_number',
                        data: account_number
                    })
                    wx.setStorage({
                        key: 'bank_name',
                        data: name
                    })
                    wx.setStorage({
                        key: 'bank_idx',
                        data: bankIdx
                    })
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