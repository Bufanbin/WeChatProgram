var app = getApp();
var orderId;
var isSub = false;
Page({
    code: 1,
    data: {
        user_inte: false,
        addressid: 0,
        addrIdx: 0,
        selidx: -1,
        remark: '',
        showRemark: false,
        selget: 1,
        uname: '',
        uphone: '',
        get_deliver: 0,
        get_self: 0
    },
    onLoad: function (e) {
        app.addIplog();
        orderId = e.order_id;
    },
    onShow: function () {
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var selget = this.data.selget;
        app.sendRequest({
            url: '/webapp/createGroupgoods',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                order_id: orderId,
                addressid: that.data.addressid,
                is_self: selget - 1
            },
            success: function (res) {
                if (res.code == 1 || res.code == 3) {
                    that.code = res.code;
                    var newselget = selget;
                    if (res.new_sendway != 2) {
                        newselget = res.new_sendway + 1;
                    }
                    that.setData({
                        address: res.address,
                        loaded: true,
                        orderList: res.goodlist,
                        total: res.totalnum,
                        freight: res.freight,
                        balance: res.totalprice,
                        needaddress: res.needaddress,
                        storeinfo: res.storeinfo,
                        selget: newselget,
                        new_sendway: res.new_sendway,
                        new_payway: res.new_payway,
                    });
                } else {
                    app.toast({ title: data.msg });
                }
            }
        })
    },
    submitOrder: function () {
        if (isSub) {
            return false;
        }
        isSub = true;
        if (this.code == 3) {
            isSub = false;
            app.toast({ title: '该地址不在配送范围内' });
            return false;
        }
        var that = this;
        var address = this.data.address;
        var selget = this.data.selget;
        var errmsg = '';
        var needaddress = 0;
        var consignee = '';
        var telphone = '';
        var saddress = '';
        var city = '';
        if (this.data.needaddress) {
            needaddress = 1;
            consignee = address.consignee;
            telphone = address.telphone;
            saddress = address.province + address.city + address.county + address.street;
            city = address.province;
        }
        if (selget == 2) {
            consignee = this.data.uname;
            telphone = this.data.uphone;
            if (!consignee) {
                isSub = false;
                app.toast({ title: '亲-请完善提件人姓名' });
                return;
            }
            if (!telphone) {
                isSub = false;
                app.toast({ title: '亲-请完善提件人电话' });
                return;
            }
            var reg = /^1[3|4|5|6|7|8]\d{9}$/;
            if (!reg.test(telphone)) {
                isSub = false;
                app.toast({ title: '亲-你填写的提件人电话格式有误，谢谢。' });
                return;
            }
        }
        var remarks = '';
        var glist = this.data.orderList;
        if (glist[0].remark) {
            remarks = glist[0].remark;
        }
        app.sendRequest({
            url: '/webapp/submitGrouporder',
            method: 'post',
            data: {
                consignee: consignee,
                telphone: telphone,
                address: saddress,
                order_id: orderId,
                needaddress: needaddress,
                remarks: remarks,
                city: city,
                is_self: selget - 1
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
                            isSub = false;
                            that.sendNotice(res.payinfo.package, res.orderid, errmsg, 1);
                            that.goToOrderDetail(res.orderid, res.good_id, res.groupid);
                        },
                        fail: function (data) {
                            isSub = false;
                            errmsg = data.errMsg
                            that.sendNotice(res.payinfo.package, res.orderid, errmsg, 2);
                        }
                    })
                } else if (res.code == 3) {
                    isSub = false;
                    app.toast({ title: '亲~当前无法支付，你支付的订单中某个商品库存不足， 请重新下单，谢谢。' });
                } else if (res.code == 4) {
                    isSub = false;
                    app.showModal({
                        content: '商家未添加支付，暂时无法支付'
                    })
                } else if (res.code == 5) {
                    isSub = false;
                    app.showModal({
                        content: res.payinfo.msg
                    })
                } else if (res.code == 6 || res.code == 7 || res.code == 2 || res.code == 8 || res.code == 9 || res.code == 10) {
                    isSub = false;
                    app.showModal({
                        content: res.msg
                    })
                } else if (res.code == 11) {
                    var orderId = res.orderid;
                    var groupid = res.groupid;
                    var goodid = res.good_id;
                    var url = '/pintuan/groupInvitation/groupInvitation?orderId=' + orderId + '&groupid=' + groupid + '&goodid=' + goodid;
                    app.turnToPage(url);
                }
            }
        })
    },
    goToOrderDetail: function (orderId, good_id, groupid) {
        var url = '/pintuan/groupInvitation/groupInvitation?orderId=' + orderId + '&groupid=' + groupid + '&goodid=' + good_id;
        app.turnToPage(url, 1);
    },
    selectAddress: function () {
        var addrIdx = this.data.addrIdx;
        var url = '/pages/selAddress/selAddress?addrIdx=' + addrIdx + '&type=0';
        app.turnToPage(url);
    },
    backhome: function () {
        app.backhome();
    },
    sendNotice: function (formid, orderid, errmsg, status) {
        app.sendRequest({
            url: "/webapp/sendGroupnotice",
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
    },
    noAddress: function () {
        app.showModal({
            content: '亲-请先填写地址，方可提交订单，谢谢。',
        })
    },
    goToRemark: function (e) {
        var idx = app.getset(e).idx;
        var gdata = this.data.orderList;
        this.setData({
            selidx: idx,
            showRemark: true,
            remark: gdata[idx].remark
        })
    },
    enterEval: function (e) {
        var val = e.detail.value;
        var selidx = this.data.selidx;
        this.setData({
            [`orderList[${selidx}].remark`]: val
        })
    },
    confirmRemark: function () {
        this.setData({
            selidx: -1,
            showRemark: false,
            remark: ''
        })
    },
    sel_gettype: function (e) {
        var selget = this.data.selget;
        var val = app.getset(e).val;
        if (val == selget) {
            return;
        }
        this.setData({
            selget: val
        });
        this.loadData();
    },
    getname: function (e) {
        var val = e.detail.value;
        this.setData({
            uname: val
        })
    },
    getphone: function (e) {
        var val = e.detail.value;
        this.setData({
            uphone: val
        })
    },
})