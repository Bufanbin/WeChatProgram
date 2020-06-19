var app = getApp();
var id, is_city;
var paysubmit = false;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        selectIdx: 0,
        ordernav: ['快递配送', '到店自提'],
        navidx: 0,
        orderType: [
            { name: '全部', val: 0 },
            { name: '待付款', val: 1 },
            { name: '待发货', val: 2 },
            { name: '待收货', val: 3 },
            { name: '待评价', val: 4 },
        ],
        orderList: [
        ],
        delIdx: -1,
        delId: -1,
        nothing_img: app.globalData.siteBaseUrl + '/static/user/images/nothing_img.png',
        timer: ''
    },
    onLoad: function (e) {
        var selectIdx = e.typeIndex || 0;
        is_city = e.is_city || 0;
        this.setData({
            selectIdx: selectIdx,
            navidx: e.isself || 0
        })
        if (e.isself == 1) {
            var orderType = [
                { name: '全部', val: 0 },
                { name: '待付款', val: 1 },
                { name: '待自提', val: 5 },
                { name: '待评价', val: 4 },
            ];
            this.setData({
                orderType: orderType,
            });
        }
        app.addIplog();
        app.checkLogin();
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
    dataInitial: function () {
    },
    selectType: function (e) {
        var index = app.getset(e).index;
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
    backhome: function () {
        app.backhome();
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        var orderType = this.data.orderType;
        var selectIdx = this.data.selectIdx;
        var status = orderType[selectIdx].val - 1;
        var myself = this.data.navidx;
        app.sendRequest({
            url: '/webapp/myOrders',
            method: 'post',
            data: {
                openid: openid,
                status: status,
                pageNum: pagenum,
                is_city: is_city,
                myself: myself
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.orderList;
                    newdata['orderList'] = oldList.concat(res.allorders);
                    newdata['nothing'] = true;
                    that.setData(newdata);
                } else {
                    that.setData({
                        nothing: true
                    });
                }
            }
        })
    },
    goToDetail: function (e) {
        var orderid = app.getset(e).orderid;
        var bindObj = app.getset(e).type;
        app.sendRequest({
            url: '/webapp/is_delete',
            method: 'post',
            data: {
                orderid: orderid
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderid + '&bindObj=' + bindObj;
                    app.turnToPage(url);
                } else {
                    app.showModal({
                        content: res.msg,
                    })
                }
            }
        })
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
    cancelDel: function () {
        this.setData({
            delPageShow: false
        });
    },
    sureDel: function (orderid, index) {
        var that = this;
        var orderList = this.data.orderList;
        var orderid = this.data.delId;
        var index = this.data.delIdx;
        app.sendRequest({
            url: '/webapp/delOrders',
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
                }
            }
        })
    },
    sureGetGoods: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var type = dataset.type;
        if (type == 0) {
            var status = 3;
        } else if (type == 1) {
            var status = 15;
        } else if (type == 2) {
            var status = 10;
        } else if (type == 6) {
            var status = 31;
        } else {
            var status = 22;
        }
        var index = dataset.idx;
        var orderList = this.data.orderList;
        app.sendRequest({
            url: '/webapp/confirmReceipt',
            method: 'post',
            data: {
                order_id: orderid,
                bindObj: type
            },
            success: function (res) {
                if (res.code == 1) {
                    orderList[index].status = status;
                    that.setData({
                        orderList: orderList
                    });
                }
            }
        })
    },
    orderPayNow: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var bindObj = dataset.type || 0;
        var sonid = dataset.sonid || 0;
        var isself = dataset.isself || 0;
        var orderList = this.data.orderList;
        var timestr = dataset.timestr;
        var myself = dataset.myself;
        let url = '';
        var errmsg = '';
        if (bindObj == 0 || bindObj == 6) {
            url = '/webapp/orderPayNow';
            if (myself) {
                var status = 37;
            } else {
                var status = 1;
            }
        } else if (bindObj == 1) {
            url = '/webapp/ordergoods_pay';
            var status = 14;
        } else if (bindObj == 4) {
            url = '/seck/neworderPayNow';
            var status = 20;
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
                            if (bindObj == 4) {
                                var url = "/dianshang/seckillDetail/seckillDetail?id=" + res.goodid + '&timestr=' + timestr;
                            } else {
                                var url = '/dianshang/goodsDetail/goodsDetail?id=' + res.goodid + '&bindObj=' + bindObj + '&sonid=' + sonid + '&isself=' + isself;
                            }
                            app.turnToPage(url);
                        }
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
    cancelOrder: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var bindObj = dataset.type;
        var orderList = this.data.orderList;
        let url = '';
        if (bindObj == 0 || bindObj == 6) {
            url = '/webapp/cancelOrders';
            var status = 5;
        } else if (bindObj == 1) {
            url = '/webapp/newCancel';
            var status = 17;
        } else if (bindObj == 4) {
            url = '/seck/cancelOrders';
            var status = 27;
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
                    orderList[index].status = status;
                    that.setData({
                        orderList: orderList
                    });
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
        var bindObj = dataset.type;
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
                    url: '/webapp/ordersRefund',
                    method: 'post',
                    data: {
                        order_id: orderid,
                        bindObj: bindObj
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            if (orderList[index].status == 1 || orderList[index].status == 37) {
                                orderList[index].status = 6;
                            } else if (orderList[index].status == 2) {
                                orderList[index].status = 7;
                            } else if (orderList[index].status == 29) {
                                orderList[index].status = 34;
                            } else if (orderList[index].status == 30) {
                                orderList[index].status = 35;
                            }
                            orderList[index].refund = 1;
                            that.setData({
                                orderList: orderList
                            });
                        }
                        app.toast({ title: res.msg });
                    }
                })
            }
        })
    },
    goToEvaluate: function (e) {
        var orderid = app.getset(e).orderid;
        var bindObj = app.getset(e).type;
        var childid = app.getset(e).childid;
        var url = '/dianshang/evaluate/evaluate?orderid=' + orderid + '&bindObj=' + bindObj + '&childid=' + childid + '&is_city=' + is_city;
        app.turnToPage(url);
    },
    cancelRefund: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var orderList = this.data.orderList;
        var bindObj = dataset.type;
        var myself = dataset.myself || 0;
        app.sendRequest({
            url: '/webapp/cancel_refund',
            method: 'post',
            data: {
                order_id: orderid,
                bindObj: bindObj
            },
            success: function (res) {
                if (res.code == 1) {
                    if (orderList[index].status == 6) {
                        if (myself) {
                            orderList[index].status = 37;
                        } else {
                            orderList[index].status = 1;
                        }
                    } else if (orderList[index].status == 7) {
                        orderList[index].status = 2;
                    } else if (orderList[index].status == 34) {
                        orderList[index].status = 29;
                    } else if (orderList[index].status == 35) {
                        orderList[index].status = 30;
                    }
                    that.setData({
                        orderList: orderList
                    });
                }
                app.toast({ title: res.msg });
            }
        })
    },
    sendNotice: function (formid, orderid, errmsg, status) {
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
    },
    seeLogistics: function (e) {
        this.setData({
            showdialog: true,
            info: app.getset(e).info,
            infonum: app.getset(e).infonum,
            index: app.getset(e).idx,
        })
    },
    closeLogistics: function () {
        this.setData({
            showdialog: false
        })
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    seltopnav: function (e) {
        var idx = app.getset(e).idx;
        var navidx = this.data.navidx;
        if (idx != navidx) {
            if (idx == 0) {
                var orderType = [
                    { name: '全部', val: 0 },
                    { name: '待付款', val: 1 },
                    { name: '待发货', val: 2 },
                    { name: '待收货', val: 3 },
                    { name: '待评价', val: 4 },
                ];
            } else {
                var orderType = [
                    { name: '全部', val: 0 },
                    { name: '待付款', val: 1 },
                    { name: '待自提', val: 5 },
                    { name: '待评价', val: 4 },
                ];
            }
            this.setData({
                selectIdx: 0,
                navidx: idx,
                orderList: [],
                nothing: false,
                orderType: orderType
            })
            this.resetNum();
            this.loadData();
        }
    },
    writeoff: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var qrurl = dataset.qrurl || '';
        var wcode = dataset.wcode;
        var orderid = dataset.orderid;
        this.setData({
            showQr: true,
            qrUrl: qrurl
        })
        this.timer = setInterval(function () {
            app.sendRequest({
                url: '/seck/isWriteOff',
                method: 'post',
                data: {
                    order_id: orderid,
                    writeoff_code: wcode
                },
                success: function (res) {
                    if (res.code == 1) {
                        clearInterval(that.timer);
                        that.setData({
                            nothing: false,
                            showQr: false,
                            qrUrl: '',
                            orderList: []
                        });
                        that.resetNum();
                        that.loadData();
                    }
                }
            })
        }, 2000);
    },
    hiddenQR: function () {
        var that = this;
        this.setData({
            showQr: false,
            qrUrl: ''
        })
        clearInterval(that.timer);
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