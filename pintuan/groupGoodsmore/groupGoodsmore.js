var app = getApp()
var goodid;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        group: []
    },
    onLoad: function (e) {
        goodid = e.goodid;
        this.setData({
            isend: e.isend,
            goodid: goodid
        })
    },
    onShow: function () {
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/webapp/group',
            method: 'post',
            data: {
                openid: openid,
                good_id: goodid,
                pageNum: pagenum
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldgroup = that.data.group;
                    newdata['group'] = oldgroup.concat(res.group);
                    that.setData(newdata);
                    that.setData({
                        startnum: res.startnum
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
    goToGroup: function (e) {
        var dataset = app.getset(e);
        var orderid = dataset.orderid;
        var groupid = dataset.groupid;
        var goodid = dataset.goodid;
        var url = '/pintuan/groupGoodsorderdetails/groupGoodsorderdetails?orderId=&groupid=' + groupid + '&goodid=' + goodid;
        app.turnToPage(url);
    }
})