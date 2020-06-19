var app = getApp();
var child_id = 0;
var nid = '';
var shopname
Page({
    prenum: 0,
    pagenum: 1,
    haveNums: 1,
    timer: 0,
    data: {
        searchtext: '',
        inputText: '',
        searchtype: 0,
        goodstype: 0,
        storeinfo: '',
        couponlist: [],
        goodslist: [],
        distributelist: [],
        grouplist: [],
        seckilllist: [],
        order: 1,
        h1Arr: [],
        h2Arr: [],
        m1Arr: [],
        m2Arr: [],
        s1Arr: [],
        s2Arr: [],
        havenums: 0,
        dishavenums: 0,
        grouphavenums: 0,
        seckhavenums: 0,
        kjhavenums: 0,
        kjGoodLists: [],
    },
    onLoad: function (e) {
        child_id = e.childid;
        nid = e.nid || '';
        var searchtype = e.searchtype;
        var goodstype = e.goodstype;
        shopname = e.shopname;
        this.setData({
            searchtype: searchtype,
            goodstype: goodstype
        })
        wx.setNavigationBarTitle({
            title: shopname
        });
        if (goodstype != 0) {
            this.search();
        }
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
            path: '/dianshang/homeSearch/homeSearch?childid=' + child_id + '&searchtype=0&goodstype=0&shopname=' + shopname,
            success: function (res) {
            }
        }
    },
    onHide: function () {
        if (this.data.seckilllist.length > 0) {
            clearInterval(this.timer);
        }
    },
    onUnload: function () {
        if (this.data.seckilllist.length > 0) {
            clearInterval(this.timer);
        }
    },
    enterSearhText: function (e) {
        var value = e.detail.value;
        this.setData({
            inputText: value
        });
    },
    clickSearch: function (e) {
        this.stopRTime();
        var dataset = app.getset(e);
        var goodstype = dataset.goodstype;
        var searchtype = dataset.searchtype;
        if (goodstype == 0) {
            var text = this.data.inputText;
            this.setData({
                searchtext: text
            });
        } else {
            this.setData({
                goodstype: goodstype,
                searchtype: searchtype
            })
        }
        this.search();
    },
    search: function () {
        var that = this;
        var pageNum = this.pagenum;
        var orders = this.data.order;
        var goodstype = this.data.goodstype;
        var content = this.data.searchtext;
        var openid = app.getSessionKey()
        app.sendRequest({
            url: '/newapp/search_dsGoodlist',
            data: {
                nid: nid,
                child_id: child_id,
                goodstype: goodstype,
                content: content,
                pageNum: pageNum,
                orders: orders,
                openid: openid
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    that.pagenum++;
                    var havenums = 0;
                    var dishavenums = 0;
                    var grouphavenums = 0;
                    var seckhavenums = 0;
                    var goodslist = [];
                    var distributelist = [];
                    var grouplist = [];
                    var seckilllist = [];
                    var kjhavenums = 0;
                    var kjGoodLists = [];
                    if (res.kjGoodList.goods) {
                        var kjGoodoldList = that.data.kjGoodLists;
                        kjGoodLists = kjGoodoldList.concat(res.kjGoodList.goods);
                        kjhavenums = res.kjGoodList.havenums;
                    }
                    if (res.goodlist.goods) {
                        var goodsoldlist = that.data.goodslist;
                        goodslist = goodsoldlist.concat(res.goodlist.goods);
                        havenums = res.goodlist.havenums;
                    }
                    if (res.disgoodList.goods) {
                        var disoldlist = that.data.distributelist;
                        distributelist = disoldlist.concat(res.disgoodList.goods);
                        dishavenums = res.disgoodList.havenums;
                    }
                    if (res.groupGoodList.goods) {
                        var groupoldlist = that.data.grouplist;
                        grouplist = groupoldlist.concat(res.groupGoodList.goods);
                        grouphavenums = res.groupGoodList.havenums;
                    }
                    if (res.seckGoodList.goods) {
                        var seckoldlist = that.data.seckilllist;
                        seckilllist = seckoldlist.concat(res.seckGoodList.goods);
                        seckhavenums = res.seckGoodList.havenums;
                    }
                    if (that.data.searchtype == 1) {
                        that.haveNums = res.goodlist.havenums || 0;
                    } else if (that.data.searchtype == 2) {
                        that.haveNums = res.disgoodList.havenums || 0;
                    } else if (that.data.searchtype == 4) {
                        that.haveNums = res.groupGoodList.havenums || 0;
                    } else if (that.data.searchtype == 3) {
                        that.haveNums = res.seckGoodList.havenums || 0;
                    }
                    newdata['storeinfo'] = res.storeinfo;
                    newdata['goodslist'] = goodslist;
                    newdata['distributelist'] = distributelist;
                    newdata['grouplist'] = grouplist;
                    newdata['seckilllist'] = seckilllist;
                    newdata['havenums'] = havenums;
                    newdata['dishavenums'] = dishavenums;
                    newdata['grouphavenums'] = grouphavenums;
                    newdata['seckhavenums'] = seckhavenums;
                    newdata['kjGoodLists'] = kjGoodLists;
                    newdata['kjhavenums'] = kjhavenums;
                    if (seckilllist.length > 0) {
                        that.timer = setInterval(that.GetRTime, 1000);
                    }
                    that.setData(newdata);
                }
                that.setData({
                    searchNothing: true
                })
            }
        });
    },
    stopRTime: function () {
        if (this.data.seckilllist.length > 0) {
            clearInterval(this.timer);
        }
        this.prenum = 0;
        this.pagenum = 1;
        this.setData({
            h1Arr: [],
            h2Arr: [],
            m1Arr: [],
            m2Arr: [],
            s1Arr: [],
            s2Arr: [],
            goodslist: [],
            distributelist: [],
            grouplist: [],
            seckilllist: [],
            searchNothing: false,
            kjGoodLists: []
        })
    },
    GetRTime: function (compid) {
        var seckilllist = this.data.seckilllist;
        var h1Arr = this.data.h1Arr;
        var h2Arr = this.data.h2Arr;
        var m1Arr = this.data.m1Arr;
        var m2Arr = this.data.m2Arr;
        var s1Arr = this.data.s1Arr;
        var s2Arr = this.data.s2Arr;
        for (var i = 0; i < seckilllist.length; i++) {
            var h1 = 0, h2 = 0, m1 = 0, m2 = 0, s1 = 0, s2 = 0;
            h1Arr.push(h1);
            h2Arr.push(h2);
            m1Arr.push(m1);
            m2Arr.push(m2);
            s1Arr.push(s1);
            s2Arr.push(s2);
            var endtime = seckilllist[i].endtime;
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
                h1Arr.splice(i, 1, h1);
                h2Arr.splice(i, 1, h2);
                m1Arr.splice(i, 1, m1);
                m2Arr.splice(i, 1, m2);
                s1Arr.splice(i, 1, s1);
                s2Arr.splice(i, 1, s2);
                this.setData({
                    h1Arr: h1Arr,
                    h2Arr: h2Arr,
                    m1Arr: m1Arr,
                    m2Arr: m2Arr,
                    s1Arr: s1Arr,
                    s2Arr: s2Arr
                })
            }
        }
    },
    searchMore: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var haveNums = this.haveNums;
        if (prenum != pagenum && haveNums != 0) {
            this.prenum = pagenum;
            this.search();
        }
    },
    goToDetail: function (e) {
        var dataset = app.getset(e);
        var id = dataset.id;
        var bindObj = dataset.bindobj;
        var url = '';
        if (bindObj == 0) {
            url = '/dianshang/goodsDetail/goodsDetail?id=' + id + '&bindObj=' + bindObj + '&childid=' + child_id;
        } else if (bindObj == 3) {
            url = '/pintuan/groupGoodsdetail/groupGoodsdetail?id=' + id + '&childid=' + child_id;
        } else if (bindObj == 4) {
            url = '/dianshang/newseckillDetail/newseckillDetail?id=' + id + '&childid=' + child_id;
        } else if (bindObj == 7) {
            url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + app.globalData.disgrade + '&childid=' + child_id + '&num=1';
        } else if (bindObj == 8) {
            url = '/kanjia/bargainDetail/bargainDetail?id=' + id + '&childid=' + child_id;
        }
        app.turnToPage(url);
    },
    goToClassify: function (e) {
        var shopname = this.data.storeinfo.storename;
        var url = '/dianshang/good_classification/good_classification?childid=' + child_id + '&shopname=' + shopname;
        app.turnToPage(url);
    },
    orderCheck: function (e) {
        this.setData({
            searchNothing: false
        })
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
            this.stopRTime();
            this.setData({
                order: order
            })
            this.search();
        }
    }
})