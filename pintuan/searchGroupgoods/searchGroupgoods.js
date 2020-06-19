var app = getApp();
Page({
    data: {
        searchtext: '',
        inputText: '',
        inputstype: ''
    },
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    onLoad: function (e) {
        var that = this;
        var inputstype = e.inputstype || 'border-radius:11.71875rpx;';
        this.setData({
            inputstype: inputstype
        })
        wx.getStorage({
            key: 'goodsData',
            success: function (res) {
                that.setData({
                    goodslist: res.data
                });
            }
        });
        wx.setNavigationBarTitle({
            title: '商品搜索'
        })
    },
    tagSearch: function (e) {
        let text = e.target.dataset.text;
        this.setData({
            searchtext: text
        });
        this.setData({
            [`goodslist.content`]: [],
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
            searchtext: text
        });
        if (text != '') {
            this.setData({
                [`goodslist.content`]: [],
                searchNothing: false
            });
            this.resetNum();
            this.search();
        }
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
    search: function () {
        var that = this;
        let listid = this.data.goodslist.listid;
        let text = this.data.searchtext;
        var pagenum = this.pagenum;
        var selshop = this.data.goodslist.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = this.data.goodslist.childid;
        }
        app.sendRequest({
            url: '/webapp/searchGroupgoods',
            data: {
                goodname: text,
                nid: listid,
                pageNum: pagenum,
                child_id: child_id
            },
            method: 'post',
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldlist = that.data.goodslist.content;
                    newdata['goodslist.content'] = oldlist.concat(res.good);
                    that.setData(newdata);
                }
                that.setData({
                    searchNothing: true
                })
            }
        });
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    turnToDetail(e) {
        var id = app.getset(e).id;
        var url = '/pintuan/groupGoodsdetail/groupGoodsdetail?id=' + id;
        app.turnToPage(url);
    }
})