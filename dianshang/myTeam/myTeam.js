var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        list: []
    },
    onLoad: function (options) {
        app.addIplog();
        this.loadOrder();
    },
    loadOrder: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/disgoods/my_team',
            method: 'post',
            data: {
                openid: openid,
                pageNum: pagenum
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    newdata['total'] = res.total;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.list;
                    newdata['list'] = oldList.concat(res.team_list);
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