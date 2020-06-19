var app = getApp();
var dopenid = '';
Page({
    id: 0,
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        goodslist: [],
        share_icon_pic: app.globalData.siteBaseUrl + '/static/user/images/share_icon.png',
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    dataInitial: function () {
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/disgoods/disgoods_bank',
            method: 'post',
            data: {
                openid: openid,
                pageNum: pagenum
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.haveComment;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.goodslist;
                    newdata['goodslist'] = oldList.concat(res.newarr);
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
    loadmoreGoods: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    },
    onShareAppMessage: function (e) {
        var openid = app.getSessionKey();
        var pic = this.data.userInfo.avatarUrl;
        var nickname = this.data.userInfo.nickName;
        var id = e.target.dataset.id;
        var disgrade = app.globalData.disgrade;
        if (disgrade == 1 || disgrade == 2) {
            dopenid = openid;
        } else {
            dopenid = '';
        }
        app.sendRequest({
            url: '/disgoods/forward_data',
            data: {
                openid: openid,
                disopenid: openid,
                pic: pic,
                nickname: nickname
            },
            method: 'POST',
            success: function (res) {
            }
        });
        return {
            title: app.getAppTitle(),
            desc: app.getAppDescription(),
            path: '/dianshang/distDetail/distDetail?id=' + id + '&disopenid=' + dopenid,
            success: function (res) {
            }
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
    }
})