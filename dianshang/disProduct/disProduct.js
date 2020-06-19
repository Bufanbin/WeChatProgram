var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        loaded: false,
        goodslist: [],
        order: 1,
        nothing: false
    },
    onLoad: function (e) {
        app.addIplog();
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        var order = this.data.order;
        app.sendRequest({
            url: '/disweb/allDisgoods',
            method: 'post',
            data: {
                openid: openid,
                order: order,
                pageNum: pagenum,
                content: ''
            },
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.goodslist;
                    newdata['goodslist'] = oldList.concat(res.good);
                    newdata['nothing'] = true;
                    newdata['loaded'] = true;
                    if (pagenum == 1) {
                        newdata['style_type'] = res.style_type;
                    }
                    that.setData(newdata);
                } else {
                    that.setData({
                        nothing: true,
                        loaded: true
                    });
                }
            }
        })
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    loadmoreGoods: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    },
    selOrder: function (e) {
        var sel = app.getset(e).sel;
        var order = this.data.order;
        if (sel != order || sel == 3) {
            if (sel == 3) {
                if (order == 3) {
                    order = 4;
                } else {
                    order = 3;
                }
            } else {
                order = sel;
            }
            this.setData({
                goodslist: [],
                nothing: false,
                order: order
            })
            this.resetNum();
            this.loadData();
        }
    },
    goToDistDetail: function (e) {
        var id = app.getset(e).id;
        var childid = app.getset(e).childid;
        var url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + app.globalData.disgrade + '&num=1&childid=' + childid;
        app.turnToPage(url);
    },
    goToSearchProduct: function (e) {
        var url = '/dianshang/searchDistpro/searchDistpro';
        app.turnToPage(url);
    }
})