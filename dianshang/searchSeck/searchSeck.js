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
        var secklist = wx.getStorageSync('seckData');
        var inputstype = e.inputstype || 'border-radius:11.71875rpx;';
        this.setData({
            inputstype: inputstype,
            secklist: secklist,
            [`secklist.searchContent`]: []
        });
        wx.setNavigationBarTitle({
            title: '秒杀搜索'
        });
    },
    tagSearch: function (e) {
        this.stopRTime();
        let text = e.target.dataset.text;
        this.setData({
            searchtext: text
        });
        this.setData({
            [`secklist.searchContent`]: [],
            searchNothing: false
        });
        this.search();
    },
    enterSearhText: function (e) {
        var value = e.detail.value;
        this.setData({
            inputText: value
        });
    },
    clickSearch: function () {
        this.stopRTime();
        var text = this.data.inputText;
        this.setData({
            searchtext: text
        });
        this.setData({
            searchNothing: false
        });
        this.search();
    },
    search: function () {
        var that = this;
        var order = this.data.secklist.order;
        var goodname = this.data.searchtext;
        var nid;
        var shownum = this.data.secklist.shownum;
        var is_lable = this.data.secklist.classtype - 1;
        if (is_lable == 0) {
            nid = this.data.secklist.nid;
        } else {
            nid = this.data.secklist.labelid;
        }
        var selshop = this.data.secklist.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = this.data.secklist.childid;
        }
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/seck/newsearch_seckname',
            data: {
                order: order,
                goodname: goodname,
                pageNum: pagenum,
                nid: nid,
                shownum: shownum,
                is_lable: is_lable,
                child_id: child_id
            },
            method: 'post',
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldlist = that.data.secklist.searchContent;
                    newdata['secklist.searchContent'] = oldlist.concat(res.good);
                    that.setData(newdata);
                    var comdata = that.data.secklist;
                    that.timer = setInterval(function () {
                        that.GetRTime(comdata.compid)
                    }, 1000)
                    that.setData({
                        [`secklist.searchContent`]: oldlist.concat(res.good)
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
    stopRTime: function () {
        clearInterval(this.timer);
        this.setData({
            [`secklist.searchContent`]: [],
            [`secklist.h1Arr`]: [],
            [`secklist.h2Arr`]: [],
            [`secklist.m1Arr`]: [],
            [`secklist.m2Arr`]: [],
            [`secklist.s1Arr`]: [],
            [`secklist.s2Arr`]: []
        });
    },
    GetRTime: function (compid) {
        var comdata = this.data.secklist;
        var goods = comdata.searchContent;
        var h1Arr = comdata.h1Arr;
        var h2Arr = comdata.h2Arr;
        var m1Arr = comdata.m1Arr;
        var m2Arr = comdata.m2Arr;
        var s1Arr = comdata.s1Arr;
        var s2Arr = comdata.s2Arr;
        for (var i = 0; i < goods.length; i++) {
            var h1 = 0, h2 = 0, m1 = 0, m2 = 0, s1 = 0, s2 = 0;
            h1Arr.push(h1);
            h2Arr.push(h2);
            m1Arr.push(m1);
            m2Arr.push(m2);
            s1Arr.push(s1);
            s2Arr.push(s2);
            var endtime = goods[i].endtime;
            var NowTime = new Date();
            var EndTime = new Date(endtime);
            var t = EndTime.getTime() - NowTime.getTime();
            var h = 0;
            var m = 0;
            var s = 0;
            var h1, h2, m1, m2, s1, s2;
            if (t >= 0) {
                h = Math.floor(t / 1000 / 60 / 60);
                m = Math.floor(t / 1000 / 60 % 60);
                s = Math.floor(t / 1000 % 60);
                if (h < 10) {
                    h1 = 0;
                    h2 = h;
                } else {
                    h1 = Math.floor(h / 10);
                    h2 = h % 10;
                }
                if (m < 10) {
                    m1 = 0;
                    m2 = m;
                } else {
                    m1 = Math.floor(m / 10);
                    m2 = m % 10;
                }
                if (s < 10) {
                    s1 = 0;
                    s2 = s;
                } else {
                    s1 = Math.floor(s / 10);
                    s2 = s % 10;
                }
                var h1Arr = comdata.h1Arr;
                var h2Arr = comdata.h2Arr;
                var m1Arr = comdata.m1Arr;
                var m2Arr = comdata.m2Arr;
                var s1Arr = comdata.s1Arr;
                var s2Arr = comdata.s2Arr;
                h1Arr.splice(i, 1, h1);
                h2Arr.splice(i, 1, h2);
                m1Arr.splice(i, 1, m1);
                m2Arr.splice(i, 1, m2);
                s1Arr.splice(i, 1, s1);
                s2Arr.splice(i, 1, s2);
                this.setData({
                    [`secklist.h1Arr`]: h1Arr,
                    [`secklist.h2Arr`]: h2Arr,
                    [`secklist.m1Arr`]: m1Arr,
                    [`secklist.m2Arr`]: m2Arr,
                    [`secklist.s1Arr`]: s1Arr,
                    [`secklist.s2Arr`]: s2Arr
                })
            }
        }
    },
    goToSeck: function (e) {
        var id = app.getset(e).id;
        var childid = app.getset(e).childid || 0;
        var url = "/dianshang/newseckillDetail/newseckillDetail?id=" + id + '&childid=' + childid;
        app.turnToPage(url);
    }
})