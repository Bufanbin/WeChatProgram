var app = getApp();
Page({
    data: {
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#f65454'
        })
        app.addIplog();
    },
    finishbtn: function () {
        var url = '/dianshang/discashlist/discashlist';
        app.turnToPage(url, 1);
    }
})