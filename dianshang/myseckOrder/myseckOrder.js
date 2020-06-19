var app = getApp();
var id;
var paysubmit = false;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    timer: 0,
    data: {
        selectIdx: 0,
        orderType: [
            { name: '全部订单', idx: 0, status: -1 },
            { name: '待付款', idx: 1, status: 0 },
            { name: '待发货', idx: 2, status: 1 },
        ],
        orderType_other: [
            { name: '待收货', idx: 6, status: 2 },
            { name: '待评价', idx: 4, status: 3 },
            { name: '已评价', idx: 5, status: 5 },
            { name: '待自提', idx: 3, status: 4 }
        ],
        orderList: [
        ],
        showdialog: false,
        info: {},
        infonum: 1,
        index: 0,
        showother: false,
        orderstatus: -1
    },
    onLoad: function (e) {
        var orderstatus = -1;
        if (e.typeIndex == 1) {
            orderstatus = 0;
        } else if (e.typeIndex == 6) {
            orderstatus = 2;
        }
        this.setData({
            selectIdx: e.typeIndex || 0,
            orderstatus: orderstatus
        })
        app.addIplog();
    },
    onShow: function () {
        app.setPageUserInfo();
        var selectIdx = this.data.selectIdx;
        if (selectIdx == 100) {
            selectIdx = 0;
        }
        this.setData({
            selectIdx: selectIdx,
            showother: false,
            orderList: [],
            nothing: false
        })
        this.resetNum();
        this.loadData();
    },
    selectType: function (e) {
        var index = e.target.dataset.index;
        if (index == 100) {
            var showother = this.data.showother;
            this.setData({
                selectIdx: index,
                showother: !showother
            });
            return;
        }
        var orderstatus = app.getset(e).status;
        this.setData({
            selectIdx: index,
            orderList: [],
            nothing: false,
            showother: false,
            orderstatus: orderstatus
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
        var status = this.data.orderstatus;
        app.sendRequest({
            url: '/seck/seckOrderList',
            method: 'post',
            data: {
                openid: openid,
                status: status,
                pageNum: pagenum,
                is_city: 0
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
    confirmsh: function (e) {
        var that = this;
        let order = app.getset(e).order
        var orderList = this.data.orderList;
        app.sendRequest({
            url: '/webapp/confirmReceipt',
            method: 'post',
            data: {
                order_id: order,
                bindObj: 5
            },
            success: function (res) {
                if (res.code == 1) {
                    orderList[that.data.index].status = 22;
                    that.setData({
                        orderList: orderList,
                        showdialog: false
                    });
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
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
    goToEvaluate: function (e) {
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var childid = dataset.childid;
        var url = '/dianshang/evaluate/evaluate?orderid=' + orderid + '&bindObj=' + 5 + '&childid=' + childid;
        app.turnToPage(url);
    },
    cancelOrder: function (e) {
        var that = this;
        var orderid = app.getset(e).orderid;
        app.sendRequest({
            url: '/seck/cancelOrders',
            method: 'post',
            data: {
                order_id: orderid,
                bindObj: 5
            },
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        nothing: false,
                        orderList: []
                    });
                    that.resetNum();
                    that.loadData();
                } else {
                    app.toast({
                        title: res.msg
                    })
                }
            }
        })
    },
    paynow: function (e) {
        var that = this;
        var errmsg = '';
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var orderList = this.data.orderList;
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: '/seck/neworderPayNow',
            method: 'post',
            data: {
                order_id: orderid,
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
                            that.sendNotice(res.payinfo.package, orderid, errmsg, 1);
                            orderList[index].status = 20;
                            that.setData({
                                orderList: orderList
                            });
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