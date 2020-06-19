var app = getApp();
var dislevel;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    totaltype: 0,
    distotaltype: 0,
    data: {
        topArr: [],
        orderlist: [],
        seldis_grade: 0,
        seldis_type: 0,
        ordertype: [{
            name: '全部',
            num: 0
        }, {
            name: '待结算',
            num: ''
        }, {
            name: '已结算',
            num: 0
        }, {
            name: '已退货',
            num: 0
        }]
    },
    onLoad: function (e) {
        app.addIplog();
        dislevel = app.globalData.dislevel;
        this.setData({
            dislevel: dislevel
        })
        var topArr = [];
        if (dislevel == 1) {
            topArr = [{
                name: '一级订单',
                num: 0
            }];
        } else if (dislevel == 2) {
            topArr = [{
                name: '一级订单',
                num: 0
            }, {
                name: '二级订单',
                num: 0
            }]
        } else if (dislevel == 3) {
            topArr = [{
                name: '一级订单',
                num: 0
            }, {
                name: '二级订单',
                num: 0
            }, {
                name: 'T级订单',
                num: 0
            }]
        }
        this.setData({
            topArr: topArr
        })
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    seltype: function (e) {
        var type = app.getset(e).type;
        var seldis_grade = this.data.seldis_grade;
        if (seldis_grade == type) {
            return;
        }
        this.setData({
            seldis_grade: type,
            seldis_type: 0
        });
        this.totaltype = 0;
        this.resetData();
        this.loadData();
    },
    sel_ordertype: function (e) {
        var type = app.getset(e).type;
        var seldis_type = this.data.seldis_type;
        if (seldis_type == type) {
            return;
        }
        this.setData({
            seldis_type: type
        })
        this.resetData();
        this.loadData();
    },
    resetData: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
        this.setData({
            nothing: false,
            orderlist: []
        })
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var type = this.data.seldis_type;
        var pagenum = this.pagenum;
        var totaltype = this.totaltype;
        var distotaltype = this.distotaltype;
        var seldis_grade = this.data.seldis_grade + 1;
        app.sendRequest({
            url: '/disweb/mydisOrder',
            method: 'post',
            data: {
                openid: openid,
                order_status: type,
                pageNum: pagenum,
                totaltype: totaltype,
                distotaltype: distotaltype,
                order_grade: seldis_grade
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.orderlist;
                    newdata['orderlist'] = oldList.concat(res.order_list);
                }
                newdata['nothing'] = true;
                if (distotaltype == 0) {
                    var topArr = that.data.topArr;
                    topArr[0].num = res.oneallnums;
                    if (dislevel > 1) {
                        topArr[1].num = res.twoallnums;
                    }
                    if (dislevel > 2) {
                        topArr[2].num = res.threeallnums;
                    }
                    newdata['topArr'] = topArr;
                }
                if (totaltype == 0) {
                    var ordertype = that.data.ordertype;
                    ordertype[0].num = parseInt(res.waitnums) + parseInt(res.alreadynums) + parseInt(res.refundnums);
                    ordertype[1].num = res.waitnums;
                    ordertype[2].num = res.alreadynums;
                    ordertype[3].num = res.refundnums;
                    newdata['ordertype'] = ordertype;
                }
                that.setData(newdata);
                that.totaltype = 1;
                that.distotaltype = 1;
            }
        })
    },
    loadmore: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
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