var app = getApp();
var carid;
var paysubmit = false;
Page({
    data: {
        time: '00:00',
        hour: '00',
        minute: '00',
        startTime: '00:00',
        endTime: '23:59',
        businessStatus: 1
    },
    onLoad: function (e) {
        app.addIplog();
        app.setPageUserInfo();
        carid = JSON.stringify(e.carid.split(','));
        this.loadData()
    },
    selPaytype: function (e) {
        var id = app.getset(e).id;
        this.setData({
            tostore_type: id
        })
    },
    bindTimeChange: function (e) {
        let all = e.detail.value;
        this.setData({
            time: all,
            hour: all.split(':')[0],
            minute: all.split(':')[1]
        })
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/tostore_accounts',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                caridArr: carid
            },
            success: function (res) {
                var newdata = {};
                newdata['pageshow'] = true;
                newdata['meal_name'] = res.meal_name;
                newdata['meal_tel'] = res.meal_tel;
                newdata['tostore_type'] = res.tostore_type;
                newdata['totalmoney'] = res.totalmoney;
                newdata['goodslist'] = res.goodslist;
                newdata['timeStr'] = res.timeStr;
                newdata['businessStatus'] = res.businessStatus,
                    newdata['busTimeStr'] = res.busTimeStr,
                    that.setData({
                        time: res.timeStr.split('-')[0],
                        hour: res.timeStr.split('-')[0].split(':')[0],
                        minute: res.timeStr.split('-')[0].split(':')[1],
                        startTime: res.timeStr.split('-')[0],
                        endTime: res.timeStr.split('-')[1],
                    })
                that.setData(newdata)
            }
        })
    },
    bindName: function (e) {
        let name = e.detail.value;
        this.setData({
            meal_name: name
        })
    },
    bindPhone: function (e) {
        let phone = e.detail.value;
        this.setData({
            meal_tel: phone
        })
    },
    truePay: function () {
        var that = this;
        var errmsg = '';
        if (that.data.meal_name == '' || that.data.meal_name == 'undefined') {
            app.showModal({
                content: '请输入姓名',
            })
            return
        }
        if (that.data.meal_tel == '' || that.data.meal_tel == 'undefined') {
            app.showModal({
                content: '请输入电话号码',
            })
            return
        }
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: '/webapp/tostore_confirm_pay',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                nickname: that.data.userInfo.nickName,
                tostore_type: that.data.tostore_type,
                meal_name: that.data.meal_name,
                meal_tel: that.data.meal_tel,
                appointHour: that.data.hour,
                appointMinute: that.data.minute,
                caridArr: carid
            },
            success: function (res) {
                if (res.code == 1) {
                    wx.requestPayment({
                        timeStamp: res.payinfo.timeStamp,
                        nonceStr: res.payinfo.nonceStr,
                        package: res.payinfo.package,
                        signType: res.payinfo.signType,
                        paySign: res.payinfo.paySign,
                        success: function (data) {
                            paysubmit = false;
                            that.sendNotice(res.payinfo.package, res.orderid, errmsg, 1);
                            that.goToOrderDetail(res.orderid);
                        },
                        fail: function (data) {
                            paysubmit = false;
                            errmsg = data.errMsg
                            that.sendNotice(res.payinfo.package, res.orderid, errmsg, 2);
                        }
                    })
                } else if (res.code == 3) {
                    paysubmit = false;
                    app.toast({ title: '亲~当前无法支付，你支付的订单中某个商品库存不足， 请重新下单，谢谢。' });
                } else if (res.code == 4) {
                    paysubmit = false;
                    app.showModal({
                        content: '商家未添加支付，暂时无法支付',
                    })
                } else if (res.code == 5) {
                    paysubmit = false;
                    app.showModal({
                        content: res.payinfo.msg
                    })
                } else if (res.code == 6 || res.code == 7) {
                    paysubmit = false;
                    app.showModal({
                        content: res.msg
                    })
                }
            }
        })
    },
    goToOrderDetail: function (orderId) {
        var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderId + '&bindObj=2';
        setTimeout(function () {
            app.turnToPage(url, 1);
        }, 500);
    },
    sendNotice: function (formid, orderid, errmsg, status) {
        app.sendRequest({
            url: "/webapp/sendNotice",
            method: 'post',
            data: {
                status: status,
                openid: app.getSessionKey(),
                formid: formid,
                order_id: orderid,
                errmsg: errmsg
            },
            success: function (res) {
            }
        });
    }
})