var app = getApp();
var id, bindObj;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        select: -1,
        select1: 0,
        select2: -1,
        type1: [
            { name: '全部' },
            { name: '好评' },
            { name: '中评' }
        ],
        type2: [
            { name: '差评' },
            { name: '有图' }
        ],
        list: [
        ]
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        id = e.id;
        bindObj = e.bindObj;
        this.loaddata();
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
            path: '/dianshang/goodsEvaluate/goodsEvaluate?id=' + id,
            success: function (res) {
            }
        }
    },
    previewPic: function (e) {
        var url = e.target.dataset.picpath;
        wx.previewImage({
            current: '',
            urls: url
        });
    },
    changeEval1: function (e) {
        var idx = e.target.dataset.index;
        var select1 = this.data.select1;
        if (idx != select1) {
            this.resetNum();
            this.setData({
                select: idx - 1,
                select1: idx,
                select2: -1,
                list: []
            });
            this.loaddata();
        }
    },
    changeEval2: function (e) {
        var idx = e.target.dataset.index;
        var select2 = this.data.select2;
        if (idx != select2) {
            this.resetNum();
            this.setData({
                select: idx + 2,
                select2: idx,
                select1: -1,
                list: []
            });
            this.loaddata();
        }
    },
    loadMoreEval: function (e) {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loaddata();
        }
    },
    loaddata: function () {
        var that = this;
        var select = that.data.select;
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/webapp/goodsCommentList',
            data: {
                good_id: id,
                status: select,
                pagenum: pagenum,
                bindObj: bindObj
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    newdata['type1[1].num'] = res.goodnum;
                    newdata['type1[2].num'] = res.middlenum;
                    newdata['type2[0].num'] = res.badnum;
                    newdata['type2[1].num'] = res.picnum;
                    var oldlist = that.data.list;
                    newdata['list'] = oldlist.concat(res.data);
                    that.setData(newdata);
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                }
            }
        })
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    backhome: function () {
        app.backhome();
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