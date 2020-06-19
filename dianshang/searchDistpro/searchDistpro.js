var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        searchtext: '',
        inputText: '',
        goodslist: []
    },
    onLoad: function (e) {
        wx.setNavigationBarTitle({
            title: '分销产品搜索'
        });
    },
    enterSearhText: function (e) {
        var value = e.detail.value;
        this.setData({
            inputText: value
        });
    },
    clickSearch: function () {
        var text = this.data.inputText;
        this.setData({
            searchtext: text,
            searchNothing: false,
            goodslist: []
        });
        this.resetNum();
        this.search();
    },
    search: function () {
        var that = this;
        var content = this.data.searchtext;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/disweb/allDisgoods',
            data: {
                openid: openid,
                order: 1,
                pageNum: pagenum,
                content: content
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.goodslist;
                    newdata['goodslist'] = oldList.concat(res.good);
                    newdata['searchNothing'] = true;
                    if (pagenum == 1) {
                        newdata['style_type'] = res.style_type;
                    }
                    that.setData(newdata);
                } else {
                    that.setData({
                        nothing: true
                    });
                }
            }
        });
    },
    searchMore: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.search();
        }
    },
    goToDist: function (e) {
        var id = app.getset(e).id;
        var url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + app.globalData.disgrade + '&num=1';
        app.turnToPage(url);
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    goToDistDetail: function (e) {
        app.goToDistDetail(e);
    }
})