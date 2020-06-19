var app = getApp();
var goodid, orderId, groupid, childid;
var specstr = '';
Page({
    timer: 0,
    lat: '',
    lng: '',
    data: {
        srcoll: 'auto',
        goodid: 0,
        storename: '',
        endtime: '',
        h: 0,
        m: 0,
        s: 0,
        showMoreUser: false
    },
    onLoad: function (e) {
        app.addIplog();
        goodid = e.goodid;
        orderId = e.orderId;
        groupid = e.groupid;
        childid = e.childid || 0;
        this.setData({
            goodid: e.goodid,
        });
    },
    onShow: function () {
        this.loadData();
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/newpinOrderDetail',
            data: {
                good_id: goodid,
                order_id: orderId,
                groupid: groupid,
                openid: app.getSessionKey()
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    newdata['storeadress'] = res.storeadress;
                    newdata['storetime'] = res.storetime;
                    newdata['groupinfo'] = res.groupinfo;
                    newdata['groupuser'] = res.groupuser;
                    newdata['isalone'] = res.isalone;
                    newdata['orderdetail'] = res.orderdetail;
                    newdata['issuccess'] = res.issuccess;
                    newdata['is_del'] = res.is_del;
                    newdata['storename'] = res.storename;
                    if (res.orderdetail.status == 1) {
                        newdata['orderstatus'] = '拼团中';
                    } else if (res.orderdetail.status == 2) {
                        newdata['orderstatus'] = '拼团成功，待发货';
                    } else if (res.orderdetail.status == 3) {
                        newdata['orderstatus'] = '拼团失败，已过期';
                    } else if (res.orderdetail.status == 4) {
                        newdata['orderstatus'] = '拼团成功，待收货';
                    } else if (res.orderdetail.status == 5) {
                        newdata['orderstatus'] = '待评价';
                    } else if (res.orderdetail.status == 6) {
                        newdata['orderstatus'] = '已评价';
                    } else if (res.orderdetail.status == 7) {
                        newdata['orderstatus'] = '拼团成功，待自提';
                    }
                    newdata['nothing'] = false;
                    newdata['pageshow'] = true;
                    newdata['endtime'] = res.newendtime || 0;
                    that.setData(newdata);
                    that.timer = setInterval(that.GetRTime, 1000);
                    that.lat = res.latitude;
                    that.lng = res.longitude;
                }
            }
        });
    },
    onHide: function () {
        clearInterval(this.timer);
    },
    onUnload: function () {
        clearInterval(this.timer);
    },
    onShareAppMessage: function () {
        app.sendRequest({
            url: '/webapp/tjIntegral',
            data: {
                openid: app.getSessionKey()
            },
            method: 'POST',
            success: function (res) {
            }
        });
        return {
            title: app.getAppTitle(),
            desc: app.getAppDescription(),
            path: '/pintuan/groupInvitation/groupInvitation?orderId=' + orderId + '&groupid=' + groupid + '&goodid=' + goodid,
            success: function (res) {
            },
            fail: function (res) {
            }
        }
    },
    GetRTime: function () {
        var NowTime = new Date();
        var etime = this.data.endtime;
        var EndTime = new Date(etime);
        var t = EndTime.getTime() - NowTime.getTime();
        var h, m, s;
        if (t >= 0) {
            h = Math.floor(t / 1000 / 60 / 60);
            m = Math.floor(t / 1000 / 60 % 60);
            s = Math.floor(t / 1000 % 60);
            if (h < 10) {
                h = "0" + h;
            }
            if (m < 10) {
                m = "0" + m;
            }
            if (s < 10) {
                s = "0" + s;
            }
            this.setData({
                h: h,
                m: m,
                s: s,
            })
        } else {
            clearInterval(this.timer);
        }
    },
    lookMoreUser: function () {
        this.setData({
            showMoreUser: true
        })
    },
    hideMoreUser: function () {
        this.setData({
            showMoreUser: false
        })
    },
    gotoMap: function () {
        var lat = parseFloat(this.lat);
        var lng = parseFloat(this.lng);
        wx.openLocation({
            latitude: lat,
            longitude: lng
        })
    },
    restart_group: function (e) {
        var url = '/pintuan/groupGoodsdetail/groupGoodsdetail?childid=' + childid + '&id=' + goodid;
        app.turnToPage(url);
    },
    goToEvaluate: function () {
        var url = '/dianshang/evaluate/evaluate?orderid=' + orderId + '&bindObj=' + 3;
        app.turnToPage(url);
    },
    confirmsh: function () {
        var that = this;
        app.showModal({
            content: '确认收货？',
            showCancel: true,
            confirm: function () {
                app.sendRequest({
                    url: '/webapp/confirmGoods',
                    method: 'post',
                    data: {
                        order_id: orderId,
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            var url = '/pintuan/groupGoodsorderdetails/groupGoodsorderdetails?orderId=' + orderId + '&groupid=' + groupid + '&goodid=' + goodid + '&childid=' + childid;
                            app.turnToPage(url, 1);
                        } else {
                            app.toast({
                                title: res.msg
                            })
                        }
                    }
                })
            }
        })
    }
})