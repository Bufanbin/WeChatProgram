var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        typeArr: ['全部收益', '待结算', '已结算'],
        selidx: 0,
        ragelist: []
    },
    onLoad: function (e) {
        app.addIplog();
        var selidx = e.selidx || 0;
        this.setData({
            selidx: selidx
        })
        this.loadData();
    },
    seltype: function (e) {
        var idx = app.getset(e).idx;
        var selidx = this.data.selidx;
        if (idx == selidx) {
            return;
        }
        this.setData({
            selidx: idx
        });
        this.resetData();
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var type = this.data.selidx;
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/disweb/commissionDetail',
            method: 'post',
            data: {
                openid: openid,
                order_status: type,
                pageNum: pagenum,
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.ragelist;
                    newdata['ragelist'] = oldList.concat(res.com_list);
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
    loadmore: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    },
    resetData: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
        this.setData({
            nothing: false,
            ragelist: []
        })
    },
})