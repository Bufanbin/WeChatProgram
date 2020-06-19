var app = getApp();
var id;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    timer: 0,
    data: {
        selectIdx: 0,
        orderType: [
            { name: '全部', idx: 0 },
            { name: '拼团中', idx: 1 },
        ],
        orderType_other: [
            { name: '待发货', idx: 2 },
            { name: '待自提', idx: 5 },
            { name: '待收货', idx: 3 },
            { name: '拼团失败', idx: 4 },
            { name: '待评价', idx: 6 },
            { name: '已评价', idx: 7 },
        ],
        orderList: [
        ],
        showdialog: false,
        info: {},
        infonum: 1,
        index: 0,
        host: app.globalData.siteBaseUrl + '/static/user/images/',
        showother: false
    },
    onLoad: function (e) {
        this.setData({
            selectIdx: e.typeIndex || 0
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
    restart_group: function (e) {
        var goodid = app.getset(e).goodid;
        var childid = app.getset(e).childid;
        var url = '/pintuan/groupGoodsdetail/groupGoodsdetail?childid=' + childid + '&id=' + goodid;
        app.turnToPage(url);
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
        this.setData({
            selectIdx: index,
            orderList: [],
            nothing: false,
            showother: false
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
        var status = this.data.selectIdx - 1;
        app.sendRequest({
            url: '/webapp/myGrouporders',
            method: 'post',
            data: {
                openid: openid,
                status: status,
                pageNum: pagenum
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
            url: '/webapp/confirmGoods',
            method: 'post',
            data: {
                order_id: order,
            },
            success: function (res) {
                if (res.code == 1) {
                    orderList[that.data.index].status = 5;
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
                url: '/webapp/isWriteOff',
                method: 'post',
                data: {
                    order_id: orderid,
                    writeoff_code: wcode
                },
                success: function (res) {
                    if (res.code == 2) {
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
        var orderid = app.getset(e).orderid;
        var url = '/dianshang/evaluate/evaluate?orderid=' + orderid + '&bindObj=' + 3;
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