var app = getApp();
var bindObj;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        selected: 1,
        order: 'desc',
        searchText: '',
        nid: '',
        sortList: [
            { text: '销量' },
            { text: '价格' },
            { text: '时间' },
        ],
        goodsList: [
        ],
        arrow_top_pic: app.globalData.siteBaseUrl + '/static/user/images/arrow_top.png',
        arrow_bom_pic: app.globalData.siteBaseUrl + '/static/user/images/arrow_bom.png',
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        var nid = e.nid || '';
        var selected = e.selected || 1;
        var order = e.order || 'desc';
        var title = e.title || '';
        title = decodeURIComponent(title);
        bindObj = e.bindObj || 0;
        this.setData({
            selected: selected,
            order: order,
            nid: nid,
            bindObj: bindObj
        });
        var titlearr = title.split('-');
        title = titlearr[titlearr.length - 1];
        wx.setNavigationBarTitle({
            title: title,
        })
        this.loadData();
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
            path: '/dianshang/goodsList/goodsList?title=' + title,
            success: function (res) {
            }
        }
    },
    backhome: function () {
        app.backhome();
    },
    loadmore: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    },
    goodsClassify: function () {
        var selected = this.data.selected;
        var order = this.data.order;
        var url = '/dianshang/goodsClassify/goodsClassify?selected=' + selected + '&order=' + order;
        app.turnToPage(url);
    },
    selectType: function (e) {
        var order = this.data.order;
        var sel = app.getset(e).sel;
        var selected = this.data.selected;
        if (sel != selected || sel == 2 || sel == 4) {
            if (sel == 2) {
                if (selected == 2) {
                    selected = 3;
                    order = "desc";
                } else {
                    selected = 2;
                    order = "asc";
                }
            } else if (sel == 4) {
                if (selected == 4) {
                    selected = 5;
                    order = "desc";
                } else {
                    selected = 4;
                    order = "asc";
                }
            } else {
                selected = sel;
                order = "desc";
            }
            this.setData({
                selected: selected,
                loaded: false,
                goodsList: [],
                order: order,
                nothing: false
            })
            this.resetNum();
            this.loadData();
        }
    },
    sureSearch: function () {
        this.setData({
            goodsList: []
        })
        this.resetNum();
        this.loadData();
    },
    enterText: function (e) {
        var value = e.detail.value;
        this.setData({
            searchText: value
        })
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    loadData: function () {
        var that = this;
        var nid = this.data.nid;
        var searchText = this.data.searchText;
        var select = this.data.selected;
        var order = this.data.order;
        var pagenum = this.pagenum;
        if (select == 0 || select == 1) {
            var otype = -1;
        } else if (select == 2 || select == 3) {
            var otype = 1;
        } else if (select == 4 || select == 5) {
            var otype = 0;
        } else {
            var otype = 2;
        }
        var dataurl = '/webapp/goodsList';
        if (bindObj == 6) {
            dataurl = '/webapp/disgoodsList';
        } else if (bindObj == 10) {
            dataurl = '/webapp/newdisgoodsList';
        }
        app.sendRequest({
            url: dataurl,
            method: 'post',
            data: {
                ordertype: otype,
                goodname: searchText,
                orderstr: order,
                pageNum: pagenum,
                nid: nid
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldlist = that.data.goodsList;
                    newdata['goodsList'] = oldlist.concat(res.good);
                    that.setData(newdata);
                }
                that.setData({
                    nothing: true
                })
            }
        })
    },
    goToDetail: function (e) {
        var id = app.getset(e).id;
        if (bindObj == 6) {
            var url = '/dianshang/distDetail/distDetail?id=' + id;
        } else if (bindObj == 10) {
            var url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + app.globalData.disgrade + '&num=1';
        } else {
            var url = '/dianshang/goodsDetail/goodsDetail?id=' + id;
        }
        app.turnToPage(url);
    },
    del_searchtext: function () {
        this.setData({
            searchText: ''
        })
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