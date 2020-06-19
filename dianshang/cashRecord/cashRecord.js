var app = getApp();
var cashtype;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    totaltype: 0,
    data: {
        topArr: [{
            name: '全部',
            num: ''
        }, {
            name: '审核中',
            num: ''
        }, {
            name: '审核成功',
            num: ''
        }, {
            name: '审核失败',
            num: ''
        }],
        selidx: 0,
        cashlist: []
    },
    onLoad: function (e) {
        app.addIplog();
        cashtype = e.cashtype;
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
    resetData: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
        this.setData({
            nothing: false,
            cashlist: []
        })
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var type = this.data.selidx;
        var pagenum = this.pagenum;
        var totaltype = this.totaltype;
        var url = '';
        if (cashtype == 1) {
            url = '/disweb/cashInfo';
        } else {
            url = '/newapp/cashInfo';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                openid: openid,
                order_status: type,
                pageNum: pagenum,
                totaltype: totaltype
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.cashlist;
                    newdata['cashlist'] = oldList.concat(res.cash_list);
                    newdata['nothing'] = true;
                    if (totaltype == 0) {
                        var topArr = that.data.topArr;
                        topArr[0].num = parseInt(res.allnums);
                        topArr[1].num = parseInt(res.verifynums);
                        topArr[2].num = parseInt(res.verifySuccnums);
                        topArr[3].num = parseInt(res.verifyFailnums);
                        newdata['topArr'] = topArr;
                    }
                    that.setData(newdata);
                } else {
                    that.setData({
                        nothing: true
                    });
                }
                that.totaltype = 1;
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
    }
})