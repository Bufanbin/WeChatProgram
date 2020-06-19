var app = getApp();
var id;
var selected = 0;
var order = 'desc';
Page({
    data: {
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        if (e.selected) {
            selected = e.selected;
        }
        if (e.order) {
            order = e.order;
        }
        var that = this;
        app.sendRequest({
            url: '/webapp/goodType',
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        levelOne: res.levelOne,
                        levelTwo: res.levelTwo
                    })
                }
            }
        })
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    dataInitial: function () {
    },
    onShareAppMessage: function () {
        var pageRouter = this.page_router;
        app.sendRequest({
            url: '/webapp/tjIntegral',
            data: {
                openid: app.getSessionKey()
            },
            method: 'POST',
            success: function (res) {
            }
        });
        return {
            title: app.getAppTitle(),
            desc: app.getAppDescription(),
            path: '/dianshang/goodsClassify/goodsClassify?id=' + id,
            success: function (res) {
            }
        }
    },
    backhome: function () {
        app.backhome();
    },
    selectClassify: function (e) {
        var nid = app.getset(e).nid;
        var title = app.getset(e).title;
        var url = '/dianshang/goodsList/goodsList?selected=' + selected + '&order=' + order + '&nid=' + nid + '&title=' + title;
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
    }
})