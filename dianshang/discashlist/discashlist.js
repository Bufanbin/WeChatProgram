var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        typeArr: ['全部', '审核中', '提现成功', '提现失败'],
        selIdx: 0,
        list: []
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#ff4c4c'
        })
        app.addIplog();
    },
    onShow: function () {
        this.setData({
            list: [],
            nothing: false
        })
        this.resetNum();
        this.loadCash();
    },
    loadCash: function () {
        var that = this;
        var openid = app.getSessionKey();
        var status = this.data.selIdx - 1;
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/disgoods/cash_list',
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
                    var oldList = that.data.list;
                    newdata['list'] = oldList.concat(res.cash_list);
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
        this.loadCash();
    },
    loadmorecash: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadCash();
        }
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
})