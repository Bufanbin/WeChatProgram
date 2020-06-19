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
        var distlist = wx.getStorageSync('newdistData');
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
        var order = this.data.distlist.orderType;
        var goodname = this.data.searchtext;
        var nid;
        var label;
        var style = this.data.distlist.classtype;
        if (style == 1) {
            nid = this.data.distlist.listid;
        } else {
            label = this.data.distlist.labelid;
        }
        var pagenum = this.pagenum;
        var selshop = this.data.distlist.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = this.data.distlist.childid;
        }
        app.sendRequest({
            url: '/disweb/search_goods',
            data: {
                nid: nid,
                goodname: goodname,
                pageNum: pagenum,
                label: label,
                style: style,
                child_id: child_id
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
        var childid = app.getset(e).childid || 0;
        var url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + app.globalData.disgrade + '&num=1' + '&childid=' + childid;
        app.turnToPage(url);
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    }
})