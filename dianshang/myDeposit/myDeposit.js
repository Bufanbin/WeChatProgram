var app = getApp();
Page({
    data: {
        loaded: false,
        status: 0,
        showBg: false,
        showData: false,
        haveMoney: true
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
            url: '/disweb/myCommission',
            method: 'post',
            data: {
                openid: openid,
                isold: 1,
            },
            success: function (res) {
                that.setData({
                    status: res.code
                })
                if (res.code == 1) {
                    var newdata = {};
                    var disInfo = res.disInfo;
                    var myData = res.myData;
                    var upgrade_one = res.upgrade_one;
                    var upgrade_two = res.upgrade_two;
                    var disGradeInfo = res.disGradeInfo;
                    var cashset = res.cashset;
                    var min_limit = 0;
                    var max_limit = 0;
                    if (cashset) {
                        min_limit = cashset.min_limit;
                        max_limit = cashset.max_limit;
                    }
                    var grade = disInfo.grade;
                    var cashmoney = 0;
                    var disgrade = '';
                    if (grade == 1) {
                        disgrade = '青铜';
                    } else if (grade == 2) {
                        disgrade = '白银';
                    } else {
                        disgrade = '黄金';
                    }
                    cashmoney = res.balance;
                    if (cashmoney < 0) {
                        newdata['haveMoney'] = false;
                    }
                    newdata['avatar'] = disInfo.avatar;
                    newdata['nickname'] = disInfo.nickname;
                    newdata['disgrade'] = disgrade;
                    newdata['total_income'] = disInfo.total_income;
                    newdata['waitmoney'] = res.waitmoney;
                    newdata['already_cash'] = disInfo.already_cash;
                    newdata['cashmoney'] = cashmoney;
                    newdata['cashset'] = cashset;
                    newdata['min_limit'] = min_limit;
                    newdata['max_limit'] = max_limit;
                    newdata['disGradeInfo'] = disGradeInfo;
                    newdata['upgrade_one'] = upgrade_one;
                    newdata['upgrade_two'] = upgrade_two;
                    newdata['myData'] = myData;
                    newdata['dislevel'] = app.globalData.dislevel;
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
    openMydata: function (e) {
        this.setData({
            showBg: true,
            showData: true
        })
    },
    closeMydata: function (e) {
        this.setData({
            showBg: false,
            showData: false
        })
    },
    goToWithdrawal: function (e) {
        if (!this.data.cashset) {
            app.showModal({
                content: '该商家暂未设置提现信息'
            })
            return false;
        }
        if (!this.data.haveMoney) {
            return false;
        }
        var url = '/dianshang/withdrawal/withdrawal?withtype=1';
        app.turnToPage(url);
    },
    goToRageDetail: function (e) {
        var url = '/dianshang/rageDetail/rageDetail';
        app.turnToPage(url);
    },
    goToCashRecord: function (e) {
        var url = '/dianshang/cashRecord/cashRecord?cashtype=1';
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