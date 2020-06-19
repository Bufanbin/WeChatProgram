var app = getApp();
Page({
    timer: 0,
    data: {
        phone: '',
        code: '',
        timenum: 60,
        showtime: false
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#ff6b6b'
        })
        app.addIplog();
    },
    surebind: function (e) {
        var formId = e.detail.formId;
        var code = this.data.code;
        var phone = this.data.phone;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/disgoods/phone_code_check',
            method: 'post',
            data: {
                tel: phone,
                code: code,
                openid: openid
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/dianshang/cashpage/cashpage';
                    app.turnToPage(url, 1);
                } else {
                    app.toast({ title: res.msg });
                }
            }
        })
    },
    enterphone: function (e) {
        var num = e.detail.value;
        this.setData({
            phone: num
        });
    },
    entercode: function (e) {
        var num = e.detail.value;
        this.setData({
            code: num
        })
    },
    getcode: function () {
        var that = this;
        var phone = this.data.phone;
        var openid = app.getSessionKey();
        var telRule = /^1[1|2|3|4|5|6|7|8|9]\d{9}$/;
        if (phone == '') {
            app.showModal({
                content: '请先输入电话号码'
            });
            return;
        } else if (!telRule.test(phone)) {
            app.showModal({
                content: '手机号码格式不正确'
            });
            return;
        }
        this.setData({
            showtime: true
        })
        this.timer = setInterval(function () {
            var num = that.data.timenum;
            if (num <= 0) {
                clearInterval(that.timer);
                that.setData({
                    timenum: 60,
                    showtime: false
                });
            } else {
                num--;
                that.setData({
                    timenum: num
                });
            }
        }, 1000);
        app.sendRequest({
            url: '/disgoods/send_phone_code',
            method: 'post',
            data: {
                openid: openid,
                telphone: phone
            },
            success: function (res) {
            }
        })
    }
})