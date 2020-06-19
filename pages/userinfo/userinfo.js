var app = getApp();
Page({
    data: {
        namecla: 'info_input',
        phonecla: 'info_input',
        qqcla: 'info_input',
        name: '',
        phone: '',
        qq: '',
        avatar: '',
        rightIcon: app.globalData.siteBaseUrl + '/static/user/images/right_icon.png',
        is_check: 0,
        nickname: ''
    },
    onLoad: function () {
        app.setPageUserInfo();
        var userInfo = this.data.userInfo;
        this.setData({
            nickname: userInfo.nickName
        })
    },
    onShow: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/getUserInfo',
            method: 'post',
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    if (!res.data.username) {
                        newdata.name = res.data.nickname;
                    } else {
                        newdata.name = res.data.username;
                    }
                    newdata.phone = res.data.telnum;
                    newdata.qq = res.data.qq;
                    newdata.avatar = res.data.avatar;
                    newdata.is_check = res.is_check;
                    that.setData(newdata);
                }
            }
        });
    },
    goToUserset: function (e) {
        var num = app.getset(e).num;
        var is_check = this.data.is_check;
        var text = app.getset(e).text;
        var url = '/pages/userset/userset?num=' + num + '&is_check=' + is_check + '&text=' + text;
        app.turnToPage(url);
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
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    }
})