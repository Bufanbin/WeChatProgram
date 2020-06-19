var app = getApp();
var goodid, orderId, childid;
var specstr = '';
var paysubmit = false;
Page({
    timer: 0,
    lat: '',
    lng: '',
    data: {
        srcoll: 'auto',
        goodid: 0,
        storename: '',
        endtime: '',
        h1: 0,
        h2: 0,
        m1: 0,
        m2: 0,
        s1: 0,
        s2: 0
    },
    onLoad: function (e) {
        app.addIplog();
        goodid = e.goodid;
        orderId = e.orderId;
        childid = e.childid || 0;
        this.setData({
            goodid: e.goodid,
        });
    },
    onShow: function () {
        this.loadData();
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/ordersInfo',
            data: {
                order_id: orderId,
                bindObj: 5
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    var status = res.ordersinfo.status;
                    if (status == 19) {
                        newdata['orderstatus'] = '待付款';
                    } else if (status == 20) {
                        newdata['orderstatus'] = '待发货';
                    } else if (status == 36) {
                        newdata['orderstatus'] = '待自提';
                    } else if (status == 21) {
                        newdata['orderstatus'] = '待收货';
                    } else if (status == 22) {
                        newdata['orderstatus'] = '待评价';
                    } else if (status == 23) {
                        newdata['orderstatus'] = '已评价';
                    }
                    newdata['storename'] = res.storename;
                    newdata['orderdetail'] = res.goodsinfo;
                    newdata['ordersinfo'] = res.ordersinfo;
                    newdata['freight'] = res.freight;
                    newdata['remark'] = res.remark;
                    newdata['storeinfo'] = res.storeinfo;
                    newdata['nothing'] = false;
                    newdata['pageshow'] = true;
                    newdata['endtime'] = res.newendtime || 0;
                    that.setData(newdata);
                    that.timer = setInterval(that.GetRTime, 1000);
                    that.lat = res.latitude;
                    that.lng = res.longitude;
                }
            }
        });
    },
    onHide: function () {
        clearInterval(this.timer);
    },
    onUnload: function () {
        clearInterval(this.timer);
    },
    GetRTime: function () {
        var NowTime = new Date();
        var etime = this.data.endtime;
        var EndTime = new Date(etime);
        var t = EndTime.getTime() - NowTime.getTime();
        var h = 0;
        var m = 0;
        var s = 0;
        var h1, h2, m1, m2, s1, s2;
        if (t >= 0) {
            h = Math.floor(t / 1000 / 60 / 60 % 24);
            m = Math.floor(t / 1000 / 60 % 60);
            s = Math.floor(t / 1000 % 60);
            if (h < 10) {
                h1 = 0;
                h2 = h;
            } else {
                h1 = Math.floor(h / 10);
                h2 = h % 10;
            }
            if (m < 10) {
                m1 = 0;
                m2 = m;
            } else {
                m1 = Math.floor(m / 10);
                m2 = m % 10;
            }
            if (s < 10) {
                s1 = 0;
                s2 = s;
            } else {
                s1 = Math.floor(s / 10);
                s2 = s % 10;
            }
            this.setData({
                h1: h1,
                h2: h2,
                m1: m1,
                m2: m2,
                s1: s1,
                s2: s2
            })
        } else {
            clearInterval(this.timer);
        }
    },
    lookMoreUser: function () {
        this.setData({
            showMoreUser: true
        })
    },
    hideMoreUser: function () {
        this.setData({
            showMoreUser: false
        })
    },
    gotoMap: function () {
        var lat = parseFloat(this.lat);
        var lng = parseFloat(this.lng);
        wx.openLocation({
            latitude: lat,
            longitude: lng
        })
    },
    restart_group: function (e) {
        var url = '/dianshang/newseckillDetail/newseckillDetail?childid=' + childid + '&id=' + goodid;
        app.turnToPage(url);
    },
    goToEvaluate: function () {
        var url = '/dianshang/evaluate/evaluate?orderid=' + orderId + '&bindObj=' + 5;
        app.turnToPage(url);
    },
    confirmsh: function () {
        var that = this;
        app.showModal({
            content: '确认收货？',
            showCancel: true,
            confirm: function () {
                app.sendRequest({
                    url: '/webapp/confirmReceipt',
                    method: 'post',
                    data: {
                        order_id: orderId,
                        bindObj: 5
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            var url = '/dianshang/seckGoodsorderdetails/seckGoodsorderdetails?orderId=' + orderId + '&childid=' + childid;
                            app.turnToPage(url, 1);
                        } else {
                            app.toast({
                                title: res.msg
                            })
                        }
                    }
                })
            }
        })
    },
    cancelOrder: function () {
        app.sendRequest({
            url: '/seck/cancelOrders',
            method: 'post',
            data: {
                order_id: orderId,
                bindObj: 5
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/dianshang/seckGoodsorderdetails/seckGoodsorderdetails?orderId=' + orderId + '&childid=' + childid;
                    app.turnToPage(url, 1);
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    paynow: function () {
        var that = this;
        var errmsg = '';
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: '/seck/neworderPayNow',
            method: 'post',
            data: {
                order_id: orderId,
                openid: app.getSessionKey(),
                bindObj: 5
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
                            that.sendNotice(res.payinfo.package, errmsg, 1);
                            var url = '/dianshang/seckGoodsorderdetails/seckGoodsorderdetails?orderId=' + orderId + '&childid=' + childid;
                            app.turnToPage(url, 1);
                        },
                        fail: function (data) {
                            paysubmit = false;
                            errmsg = data.errMsg;
                            that.sendNotice(res.payinfo.package, errmsg, 2);
                        }
                    })
                } else if (res.code == 3) {
                    paysubmit = false;
                    app.toast({ title: '亲~当前无法支付，你支付的订单中某个商品库存不足， 请重新下单，谢谢。' });
                } else if (res.code == 4) {
                    paysubmit = false;
                    app.showModal({
                        content: '商家未添加支付，暂时无法支付'
                    })
                } else if (res.code == 5) {
                    paysubmit = false;
                    app.showModal({
                        content: res.payinfo.msg
                    })
                } else if (res.code == 6 || res.code == 7 || res.code == 9) {
                    paysubmit = false;
                    app.showModal({
                        content: res.msg,
                    })
                } else if (res.code == 10) {
                    paysubmit = false;
                    if (res.is_end == 2) {
                        app.showModal({
                            content: '活动已结束'
                        })
                    } else if (res.is_end == 3) {
                        app.showModal({
                            content: '商品已售罄'
                        })
                    }
                }
            }
        })
    },
    sendNotice: function (formid, errmsg, status) {
        app.sendRequest({
            url: "/webapp/sendNotice",
            method: 'post',
            data: {
                status: status,
                openid: app.getSessionKey(),
                formid: formid,
                order_id: orderId,
                errmsg: errmsg
            },
            success: function (res) {
            }
        });
    }
})