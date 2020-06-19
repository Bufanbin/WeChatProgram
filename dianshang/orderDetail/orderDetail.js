var app = getApp();
var orderid, bindObj;
var paysubmit = false;
Page({
    data: {
        bindObj: 0,
        status: 3,
        delPageShow: false,
        orderList: [
        ],
        tostore_status: -1
    },
    onLoad: function (e) {
        orderid = e.orderId;
        bindObj = e.bindObj || 0;
        this.setData({
            bindObj: bindObj
        })
        app.addIplog();
        this.loadData();
    },
    confirmGet: function () {
        this.setData({
            delPageShow: true
        })
    },
    paynow: function () {
        var that = this;
        let url = '';
        var errmsg = '';
        if (bindObj == 0 || bindObj == 6) {
            url = '/webapp/orderPayNow';
        } else if (bindObj == 1) {
            url = '/webapp/ordergoods_pay';
        } else if (bindObj == 4 || bindObj == 5) {
            url = '/seck/neworderPayNow';
        } else if (bindObj == 7) {
            url = '/disweb/orderPayNow';
        }
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                order_id: orderid,
                openid: app.getSessionKey(),
                bindObj: bindObj
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
                            var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderid + '&bindObj=' + bindObj;
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
    cancelOrder: function () {
        let url = '';
        if (bindObj == 0 || bindObj == 6) {
            url = '/webapp/cancelOrders';
        } else if (bindObj == 1) {
            url = '/webapp/newCancel';
        } else if (bindObj == 4 || bindObj == 5) {
            url = '/seck/cancelOrders';
        } else if (bindObj == 7) {
            url = '/disweb/cancelOrders';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                order_id: orderid,
                bindObj: bindObj
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderid + '&bindObj=' + bindObj;
                    app.turnToPage(url, 1);
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    refund: function () {
        var url = '';
        if (bindObj == 7) {
            url = '/disweb/ordersRefund';
        } else {
            url = '/webapp/ordersRefund';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                order_id: orderid
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderid;
                    app.turnToPage(url, 1);
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    sureReceive: function () {
        var that = this;
        var url = '';
        if (bindObj == 7) {
            url = '/disweb/confirmReceipt';
        } else {
            url = '/webapp/confirmReceipt';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                order_id: orderid,
                bindObj: bindObj
            },
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        delPageShow: false
                    })
                    var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderid + '&bindObj=' + bindObj;
                    app.turnToPage(url, 1);
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    cancelReceive: function () {
        this.setData({
            delPageShow: false
        })
    },
    backhome: function () {
        app.backhome();
    },
    loadData: function () {
        var that = this;
        var url = '';
        if (bindObj == 7) {
            url = '/disweb/ordersInfo';
        } else {
            url = '/webapp/ordersInfo';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                order_id: orderid,
                bindObj: bindObj
            },
            success: function (res) {
                if (res.code == 1) {
                    var needmoney = (parseFloat(res.ordersinfo.vip_money) + parseFloat(res.ordersinfo.realmoney)).toFixed(2);
                    var goodsprice = 0;
                    for (var i = 0; i < res.goodsinfo.length; i++) {
                        goodsprice += parseFloat(res.goodsinfo[i].totalmoney);
                    }
                    goodsprice = goodsprice.toFixed(2);
                    that.setData({
                        needmoney: needmoney,
                        orderList: res.goodsinfo,
                        orderInfo: res.ordersinfo,
                        freight: res.freight,
                        reduce: res.reduce,
                        memreduce: res.memreduce,
                        exmoney: res.exmoney,
                        tostore_status: res.tostore_status || '',
                        ordertime: res.ordertime || '',
                        timelong: res.timelong || '',
                        show: true,
                        timestr: res.timestr || '',
                        storename: res.storename,
                        remark: res.remark,
                        childid: res.child_id,
                        storeinfo: res.storeinfo || '',
                        goodsprice: goodsprice
                    });
                } else {
                    that.setData({
                        show: true
                    })
                }
            }
        });
    },
    goToGoodDetail: function (e) {
        var id = app.getset(e).id;
        var sonid = app.getset(e).sonid || 0;
        var isself = app.getset(e).isself || 0;
        var timestr = this.data.timestr || '';
        var childid = this.data.childid;
        if (bindObj == 4) {
            var url = "/dianshang/seckillDetail/seckillDetail?id=" + id + '&timestr=' + timestr;
        } else if (bindObj == 5) {
            var url = "/dianshang/newseckillDetail/newseckillDetail?id=" + id + '&childid=' + childid;
        } else if (bindObj == 6) {
            var url = "/dianshang/distDetail/distDetail?id=" + id + '&disgrade=' + app.globalData.disgrade;
        } else if (bindObj == 7) {
            var url = "/dianshang/distDetail/distDetail?id=" + id + '&disgrade=' + app.globalData.disgrade + '&childid=' + childid + '&num=1';
        } else {
            var url = '/dianshang/goodsDetail/goodsDetail?id=' + id + '&bindObj=' + bindObj + '&sonid=' + sonid + '&isself=' + isself + '&childid=' + childid;
        }
        app.turnToPage(url, 1);
    },
    sendNotice: function (formid, errmsg, status) {
        app.sendRequest({
            url: "/webapp/sendNotice",
            method: 'post',
            data: {
                status: status,
                openid: app.getSessionKey(),
                formid: formid,
                order_id: orderid,
                errmsg: errmsg
            },
            success: function (res) {
            }
        });
    }
})