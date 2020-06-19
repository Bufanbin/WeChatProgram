var app = getApp();
Page({
    data: {
        addList: []
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#ff6060'
        })
        app.setPageUserInfo();
        app.addIplog();
    },
    onShow: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/shipAddress',
            method: 'post',
            data: {
                openid: app.getSessionKey()
            },
            success: function (res) {
                that.setData({
                    addressList: res.shipaddress,
                    loaded: true
                })
            }
        })
    },
    changeDefault: function (e) {
        var index = e.target.dataset.index;
        var addList = this.data.addressList;
        for (var i = 0; i < addList.length; i++) {
            if (i == index) {
                addList[i].isdefault = 1;
            } else {
                addList[i].isdefault = 0;
            }
        }
        this.setData({
            addressList: addList
        });
        app.sendRequest({
            url: '/webapp/changeDefault',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                id: addList[index].id,
                isdefault: addList[index].isdefault,
            },
            success: function (res) {
            }
        })
    },
    deleteAdd: function (e) {
        var index = app.getset(e).index;
        var addList = this.data.addressList;
        app.sendRequest({
            url: '/webapp/delAddress',
            method: 'post',
            data: {
                id: addList[index].id
            },
            success: function (res) {
            }
        });
        addList.splice(index, 1);
        this.setData({
            addressList: addList
        })
    },
    editAdd: function (e) {
        var index = app.getset(e).index;
        var url = '/pages/filladdress/filladdress?edit=1&index=' + index;
        app.turnToPage(url);
    },
    addNewAddress: function () {
        var url = '/pages/filladdress/filladdress?edit=0';
        app.turnToPage(url);
    },
    backhome: function () {
        app.backhome();
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    closenewgift: function () {
        app.closenewgift();
    },
})