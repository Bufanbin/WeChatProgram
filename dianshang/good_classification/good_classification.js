var app = getApp();
var shopname, childid;
Page({
    data: {
        goodsOpen: false,
        disgoodsOpen: false,
        groupgoodsOpen: false,
        seckgoodsOpen: false
    },
    onLoad: function (e) {
        shopname = e.shopname;
        childid = e.childid;
        app.setPageTitle(shopname);
        this.loadData();
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/newapp/ds_goodstype',
            data: {
                child_id: childid
            },
            method: 'post',
            success: function (res) {
                that.setData({
                    disgoodsArr: res.disgoodsType,
                    goodsArr: res.goodsType,
                    groupgoodsArr: res.groupgoodsType,
                    seckgoodsArr: res.seckgoodsType
                })
            }
        })
    },
    shrinkClassify: function (e) {
        var that = this;
        var name = app.getset(e).name;
        var flag = this.data[name];
        this.setData({
            [`${name}`]: !flag
        });
    },
    goToList: function (e) {
        var nid = app.getset(e).nid;
        var searchtype = app.getset(e).searchtype;
        var goodstype = app.getset(e).goodstype;
        var url = '/dianshang/homeSearch/homeSearch?childid=' + childid + '&searchtype=' + searchtype + '&nid=' + nid + '&goodstype=' + goodstype + '&shopname=' + shopname;
        app.turnToPage(url);
    }
})