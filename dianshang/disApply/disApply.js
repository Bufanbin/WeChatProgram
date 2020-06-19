var app = getApp();
var paysubmit = false;
Page({
    data: {
        hasdata: false
    },
    onLoad: function (e) {
        app.addIplog();
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    dataInitial: function () {
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/disweb/disApply',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                var dis_set = res.dis_set;
                if (!dis_set) {
                    that.setData({
                        loaded: true,
                        hasdata: false
                    })
                } else {
                    var full_money = parseFloat(dis_set['full_money']);
                    var need_enter_money = parseFloat(dis_set['enter_money']);
                    var telphone = dis_set['telphone'];
                    var needbuy = parseFloat((full_money - res.upaymoney).toFixed(2));
                    that.setData({
                        remarks: res.remarks,
                        verify: res.verify,
                        telphone: telphone,
                        full_money: full_money,
                        need_enter_money: need_enter_money,
                        upaymoney: parseFloat(res.upaymoney),
                        enter_money: parseFloat(res.enter_money),
                        needbuy: needbuy,
                        newenter_money: res.enter_money,
                        loaded: true,
                        hasdata: true,
                        isbuy: dis_set['isbuy'],
                        ispay: dis_set['ispay'],
                        is_free: dis_set['is_free']
                    })
                }
            }
        })
    },
    goToBuy: function () {
        var url = '/dianshang/disProduct/disProduct';
        app.turnToPage(url);
    },
    goToPay: function () {
        var that = this;
        var openid = app.getSessionKey();
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: '/disweb/enterMoney',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                if (res.code == 1) {
                    wx.requestPayment({
                        timeStamp: res.payinfo.timeStamp,
                        nonceStr: res.payinfo.nonceStr,
                        package: res.payinfo.package,
                        signType: res.payinfo.signType,
                        paySign: res.payinfo.paySign,
                        success: function (data) {
                            paysubmit = false;
                            that.loadData();
                        },
                        fail: function (data) {
                            paysubmit = false;
                        }
                    })
                } else if (res.code == 5) {
                    paysubmit = false;
                    app.showModal({
                        content: res.payinfo.msg,
                        confirm: function () {
                        }
                    })
                }
            }
        })
    },
    sureApply: function (e) {
        var needbuy = this.data.needbuy;
        var enter_money = this.data.enter_money;
        var ispay = this.data.ispay;
        var isbuy = this.data.isbuy;
        var is_free = this.data.is_free;
        var need_enter_money = this.data.need_enter_money;
        if ((needbuy <= 0 && isbuy > 0) || enter_money > 0 || (ispay > 0 && need_enter_money == 0) || is_free == 1) {
            var formid = e.detail.formId;
            var openid = app.getSessionKey();
            var uinfo = this.data.userInfo;
            var nickname = uinfo.nickName;
            var avatar = uinfo.avatarUrl;
            var that = this;
            var use_goods;
            if (this.data.full_money > 0 && this.data.newenter_money == 0) {
                use_goods = 1;
            }
            var disopenid = app.globalData.disopenid || '';
            app.sendRequest({
                url: '/disweb/apply',
                method: 'post',
                data: {
                    formid: formid,
                    enter_money: enter_money,
                    openid: openid,
                    nickname: nickname,
                    avatar: avatar,
                    use_goods: use_goods,
                    disopenid: disopenid
                },
                success: function (res) {
                    app.showModal({
                        content: res.msg,
                        confirm: function () {
                            if (res.is_free == 1) {
                                var url = "/pages/iWantDis/iWantDis";
                                app.turnToPage(url, 1);
                            } else {
                                that.loadData();
                            }
                        }
                    })
                }
            })
        }
    }
});