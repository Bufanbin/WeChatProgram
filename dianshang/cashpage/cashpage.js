var app = getApp();
Page({
    data: {
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#3393ec'
        })
        app.addIplog();
    },
    surecash: function (e) {
        var openid = app.getSessionKey();
        var money = e.detail.value.cashnum;
        var cash = parseFloat(money);
        var formId = e.detail.formId;
        var color = this.data.color;
        if (money == '' || cash < 1) {
            app.showModal({
                content: '提现金额必须大于1元'
            })
            return;
        }
        app.sendRequest({
            url: '/disgoods/confirm_cash',
            method: 'post',
            data: {
                openid: openid,
                cashMoney: cash
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/dianshang/cashsuccess/cashsuccess?themecolor=' + color;
                    app.turnToPage(url, 1);
                } else {
                    app.toast({ title: res.msg });
                }
            }
        })
    }
})