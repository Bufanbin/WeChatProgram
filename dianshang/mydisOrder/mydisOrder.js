var app = getApp();
var paysubmit = false;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        loaded: false,
        selectIdx: 0,
        orderType: [
            { name: '全部' },
            { name: '待付款' },
            { name: '待发货' },
            { name: '待收货' },
            { name: '待评价' },
        ],
        orderList: [],
        delIdx: -1,
        delId: -1,
        showTip: false
    },
    onLoad: function (e) {
        app.addIplog();
    },
    onShow: function () {
        app.setPageUserInfo();
        this.setData({
            orderList: [],
            nothing: false
        })
        this.resetNum();
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        var status = this.data.selectIdx - 1;
        app.sendRequest({
            url: '/disweb/myOrders',
            method: 'post',
            data: {
                openid: openid,
                status: status,
                pageNum: pagenum
            },
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.orderList;
                    newdata['orderList'] = oldList.concat(res.allorders);
                    newdata['nothing'] = true;
                    newdata['loaded'] = true;
                    that.setData(newdata);
                } else {
                    that.setData({
                        nothing: true,
                        loaded: true
                    });
                }
            }
        })
    },
    selectType: function (e) {
        var index = e.target.dataset.index;
        this.setData({
            selectIdx: index,
            orderList: [],
            nothing: false
        })
        this.resetNum();
        this.loadData();
    },
    loadmoreOrder: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    backhome: function () {
        app.backhome();
    },
    orderPayNow: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var sonid = dataset.sonid || 0;
        var isself = dataset.isself || 0;
        var orderList = this.data.orderList;
        let url = '';
        var errmsg = '';
        var status = 1
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: '/disweb/orderPayNow',
            method: 'post',
            data: {
                order_id: orderid,
                openid: app.getSessionKey()
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
                            that.sendNotice(res.payinfo.package, orderid, errmsg, 1);
                            orderList[index].status = status;
                            that.setData({
                                orderList: orderList
                            })
                        },
                        fail: function (data) {
                            paysubmit = false;
                            errmsg = data.errMsg;
                            that.sendNotice(res.payinfo.package, orderid, errmsg, 2);
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
                } else if (res.code == 8) {
                    paysubmit = false;
                    app.showModal({
                        content: res.msg,
                        showCancel: true,
                        confirmText: '查看商品',
                        confirm: function () {
                            var url = '/dianshang/distDetail/distDetail?id=' + res.goodid + '&disgrade=' + app.globalData.disgrade + '&num=' + num + '&sonid=' + sonid + '&isself=' + isself;
                            app.turnToPage(url);
                        }
                    })
                }
            }
        })
    },
    cancelOrder: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var orderList = this.data.orderList;
        var status = 5;
        app.sendRequest({
            url: '/disweb/cancelOrders',
            method: 'post',
            data: {
                order_id: orderid
            },
            success: function (res) {
                if (res.code == 1) {
                    orderList[index].status = status;
                    that.setData({
                        orderList: orderList
                    });
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    refundOrder: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var orderList = this.data.orderList;
        var canrefund = dataset.canrefund;
        if (canrefund == 0) {
            wx.showToast({
                title: '当前订单无法取消',
                icon: 'none',
            })
            return;
        }
        app.showModal({
            content: '确认退款？',
            showCancel: true,
            confirm: function () {
                app.sendRequest({
                    url: '/disweb/ordersRefund',
                    method: 'post',
                    data: {
                        order_id: orderid
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            app.toast({ title: res.msg });
                            if (orderList[index].status == 1) {
                                orderList[index].status = 6;
                            } else if (orderList[index].status == 2) {
                                orderList[index].status = 7;
                            }
                            orderList[index].refund = 1;
                            that.setData({
                                orderList: orderList
                            });
                        } else if (res.code == 3) {
                            that.setData({
                                showTip: true
                            })
                            setTimeout(function () {
                                that.setData({
                                    showTip: false
                                })
                            }, 1500)
                        } else {
                            app.toast({ title: res.msg });
                        }
                    }
                })
            }
        })
    },
    sureGetGoods: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var status = 3;
        var orderList = this.data.orderList;
        app.sendRequest({
            url: '/disweb/confirmReceipt',
            method: 'post',
            data: {
                order_id: orderid
            },
            success: function (res) {
                if (res.code == 1) {
                    orderList[index].status = status;
                    that.setData({
                        orderList: orderList
                    });
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    goToEvaluate: function (e) {
        var orderid = app.getset(e).orderid;
        var childid = app.getset(e).childid;
        var url = '/dianshang/evaluate/evaluate?orderid=' + orderid + '&bindObj=7&childid=' + childid + '&is_city=0';
        app.turnToPage(url);
    },
    deleteOrder: function (e) {
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        this.setData({
            delPageShow: true,
            delIdx: index,
            delId: orderid
        })
    },
    cancelRefund: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var orderList = this.data.orderList;
        app.sendRequest({
            url: '/disweb/cancel_refund',
            method: 'post',
            data: {
                order_id: orderid
            },
            success: function (res) {
                if (res.code == 1) {
                    if (orderList[index].status == 6) {
                        orderList[index].status = 1;
                    } else if (orderList[index].status == 7) {
                        orderList[index].status = 2;
                    }
                    that.setData({
                        orderList: orderList
                    });
                    app.toast({ title: res.msg });
                } else if (res.code == 3) {
                    that.setData({
                        showTip: true
                    })
                    setTimeout(function () {
                        that.setData({
                            showTip: false
                        })
                    }, 1500)
                } else {
                    app.toast({ title: res.msg });
                }
            }
        })
    },
    cancelDel: function () {
        this.setData({
            delPageShow: false
        });
    },
    sureDel: function () {
        var that = this;
        var orderList = this.data.orderList;
        var orderid = this.data.delId;
        var index = this.data.delIdx;
        app.sendRequest({
            url: '/disweb/delOrders',
            method: 'post',
            data: {
                order_id: orderid
            },
            success: function (res) {
                if (res.code == 1) {
                    orderList.splice(index, 1);
                    that.setData({
                        orderList: orderList,
                        delPageShow: false
                    });
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    goToDetail: function (e) {
        var orderid = app.getset(e).orderid;
        app.sendRequest({
            url: '/disweb/is_delete',
            method: 'post',
            data: {
                orderid: orderid
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderid + '&bindObj=7';
                    app.turnToPage(url);
                } else {
                    app.showModal({
                        content: res.msg,
                    })
                }
            }
        })
    },
    sendNotice: function (formid, orderid, errmsg, status) {
        app.sendRequest({
            url: "/disweb/sendNotice",
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