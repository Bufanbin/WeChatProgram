var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        searchtext: '',
        inputText: '',
        timer: 0,
        inputstype: ''
    },
    onLoad: function (e) {
        var distlist = wx.getStorageSync('distData');
        var inputstype = e.inputstype || 'border-radius:11.71875rpx;';
        this.setData({
            inputstype: inputstype,
            distlist: distlist,
            [`distlist.searchContent`]: []
        });
        wx.setNavigationBarTitle({
            title: '分销搜索'
        });
    },
    tagSearch: function (e) {
        let text = e.target.dataset.text;
        this.setData({
            searchtext: text
        });
        this.setData({
            [`distlist.searchContent`]: [],
            searchNothing: false
        });
        this.resetNum();
        this.search();
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
            [`distlist.searchContent`]: [],
        });
        this.resetNum();
        this.search();
    },
    search: function () {
        var that = this;
        let listid = this.data.distlist.listid;
        var order = this.data.distlist.orderType;
        var goodname = this.data.searchtext;
        var nid = this.data.distlist.nid;
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/webapp/searchGoods',
            data: {
                goodname: goodname,
                nid: listid,
                pageNum: pagenum,
                bindObj: 6
            },
            method: 'post',
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldlist = that.data.distlist.searchContent;
                    newdata['distlist.searchContent'] = oldlist.concat(res.good);
                    that.setData(newdata);
                    that.setData({
                        [`distlist.searchContent`]: oldlist.concat(res.good)
                    })
                }
                that.setData({
                    searchNothing: true
                })
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
        var url = "/dianshang/distDetail/distDetail?id=" + id + '&disgrade=' + app.globalData.disgrade;
        app.turnToPage(url);
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    }
})