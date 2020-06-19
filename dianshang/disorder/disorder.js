var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        typeArr: ['所有订单', '已付款', '已收货', '已结算', '已退款'],
        selIdx: 0,
        list: []
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#ff4c4c'
        })
        app.checkLogin();
    },
    onShow: function () {
        this.setData({
            list: [],
            nothing: false
        })
        this.resetNum();
        this.loadOrder();
    },
    loadOrder: function () {
        var that = this;
        var openid = app.getSessionKey();
        var end_status = this.data.selIdx - 1;
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/disgoods/dis_orderlist',
            method: 'post',
            data: {
                openid: openid,
                end_status: end_status,
                pageNum: pagenum
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.list;
                    newdata['list'] = oldList.concat(res.order_list);
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
    selType: function (e) {
        var idx = app.getset(e).idx;
        var selIdx = this.data.selIdx;
        if (idx == selIdx) {
            return;
        }
        this.setData({
            selIdx: idx,
            list: [],
            nothing: false
        })
        this.resetNum();
        this.loadOrder();
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    loadmoreOrder: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadOrder();
        }
    },
})