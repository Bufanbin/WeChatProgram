var app = getApp();
Page({
    data: {
        storename: '',
        inputText: '',
        loaded: false,
        searchNothing: false,
        prenum: 0,
        pagenum: 1,
        havenums: 1,
        inputstype: ''
    },
    onLoad: function (e) {
        var that = this;
        var inputstype = e.inputstype || 'border-radius:11.71875rpx;';
        this.setData({
            inputstype: inputstype
        })
        wx.getStorage({
            key: 'goodshopData',
            success: function (res) {
                that.setData({
                    goodsshoplist: res.data
                });
            }
        });
        wx.setNavigationBarTitle({
            title: '门店搜索'
        })
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
            storename: text
        });
        this.setData({
            [`goodsshoplist.searchContent`]: [],
            searchNothing: false
        });
        this.resetNum();
        this.search();
    },
    searchMore: function () {
        var prenum = this.data.prenum;
        var pagenum = this.data.pagenum;
        var havenums = this.data.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.setData({
                prenum: pagenum
            })
            this.search();
        }
    },
    search: function () {
        var that = this;
        var goodsshoplist = this.data.goodsshoplist;
        var pageNum = this.data.pagenum;
        var lat = goodsshoplist.lat;
        var lng = goodsshoplist.lng;
        var storename = this.data.storename;
        app.sendRequest({
            url: '/newapp/goodsStoreList',
            data: {
                lat: lat,
                lng: lng,
                numPerPage: 10,
                storename: storename,
                pageNum: pageNum
            },
            method: 'post',
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    pageNum++;
                    that.havenums = res.haveNums;
                    var oldlist = goodsshoplist.searchContent;
                    var newlist = oldlist.concat(res.sonstoreArr);
                    newdata[`goodsshoplist.searchContent`] = newlist;
                    newdata[`havenums`] = res.haveNums;
                    newdata[`pagenum`] = pageNum;
                    newdata['searchNothing'] = true;
                    newdata['loaded'] = true;
                    that.setData(newdata)
                } else {
                    that.setData({
                        searchNothing: true,
                        loaded: true,
                        havenums: 0
                    })
                }
            }
        });
    },
    resetNum: function () {
        this.setData({
            prenum: 0,
            pagenum: 1,
            havenums: 1
        })
    },
    goToShopHome: function (e) {
        var index = app.getset(e).index;
        var goodsshoplist = this.data.goodsshoplist;
        var child_id = goodsshoplist.searchContent[index].child_id;
        var url = '/dianshang/shopHome/shopHome?childid=' + child_id;
        app.turnToPage(url);
    }
})