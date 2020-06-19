var app = getApp();
Page({
    data: {
        loaded: false,
        status: 0,
        total_income: 0,
        already_cash: 0,
        left_cash: 0,
        poundage: 0
    },
    onLoad: function (e) {
        app.addIplog();
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/newapp/myCommission',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                that.setData({
                    status: res.code
                })
                if (res.code == 1) {
                    var newdata = {};
                    var info = res.info;
                    var total_income = info.total_income || 0;
                    var already_cash = info.already_cash || 0;
                    var poundage = info.poundage || 0;
                    var left_cash = (parseFloat(total_income) - parseFloat(already_cash) - parseFloat(poundage)).toFixed(2);
                    newdata['total_income'] = total_income;
                    newdata['already_cash'] = already_cash;
                    newdata['left_cash'] = left_cash;
                    newdata['poundage'] = poundage;
                    newdata['cashset'] = res.cashset;
                    newdata['loaded'] = true;
                    that.setData(newdata);
                } else {
                    app.showModal({
                        content: res.msg,
                        confirm: function () {
                            app.turnBack();
                        }
                    })
                }
            }
        })
    },
    goToWithdrawal: function (e) {
        if (!this.data.cashset) {
            app.showModal({
                content: '该商家暂未设置提现信息'
            })
            return false;
        }
        var url = '/dianshang/withdrawal/withdrawal?withtype=2';
        app.turnToPage(url);
    },
    goToCashRecord: function (e) {
        var url = '/dianshang/cashRecord/cashRecord?cashtype=2';
        app.turnToPage(url);
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    closenewgift: function () {
        app.closenewgift();
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    }
})