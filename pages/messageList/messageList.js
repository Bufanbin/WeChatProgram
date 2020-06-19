var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        loaded: false,
        nothing: false,
        selArr: [],
        selidx: 0,
        num: 0,
        type: 0,
        isset: 0,
        noticeList: [],
        msg_coupbg_pic: app.globalData.siteBaseUrl + '/static/user/images/msg_coupbg.png',
    },
    onLoad: function (e) {
        app.addIplog();
        var num = e.num;
        var title = '';
        var selArr = [];
        var type = 0;
        var selidx = 0;
        if (num == 1) {
            title = '电商';
            type = 7;
        } else if (num == 2) {
            title = '拼团';
            selArr = ['物流', '通知'];
            type = 0;
        } else if (num == 3) {
            title = '分销';
            selArr = ['物流', '通知'];
            type = 1;
        } else if (num == 4) {
            title = '秒杀';
            selArr = ['物流', '通知'];
            type = 2;
        } else if (num == 5) {
            title = '砍价';
            selArr = ['物流', '通知'];
            type = 3;
        } else if (num == 6) {
            title = '其他通知';
            selArr = ['优惠', '通知'];
            type = 8;
        } else if (num == 7) {
            title = '零售餐饮';
            selArr = ['物流', '通知'];
            type = 6;
        } else if (num == 8) {
            title = '同城';
            selArr = ['物流', '通知'];
            type = 4;
        } else if (num == 9) {
            title = '预约到店';
            selArr = ['物流', '通知'];
            type = 5;
        } else if (num == 10) {
            title = '酒店预订';
            type = 9;
            selidx = 1;
        }
        this.setData({
            num: num,
            selArr: selArr,
            type: type,
            selidx: selidx
        })
        app.setPageTitle(title);
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var type = this.data.type;
        var notice_type = this.data.selidx;
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/newapp/typeNotice',
            method: 'post',
            data: {
                openid: openid,
                type: type,
                notice_type: notice_type,
                pageNum: pagenum
            },
            success: function (res) {
                if (res.code == 1) {
                    that.havenums = res.haveNums;
                    that.pagenum = that.pagenum + 1;
                    var newdata = {};
                    var oldlist = that.data.noticeList;
                    newdata['isset'] = res.isset;
                    newdata['noticeList'] = oldlist.concat(res.noticeList);
                    newdata['loaded'] = true;
                    newdata['nothing'] = true;
                    that.setData(newdata);
                } else {
                    that.setData({
                        loaded: true,
                        nothing: true
                    })
                }
            }
        })
    },
    loadMoreData: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    },
    sel_type: function (e) {
        var idx = app.getset(e).idx;
        if (this.data.selidx == idx) {
            return;
        }
        this.setData({
            selidx: idx
        })
        this.resetNum();
        this.loadData();
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
        this.setData({
            noticeList: [],
            nothing: false
        })
    },
    getLocation: function (options) {
        wx.getLocation({
            type: 'wgs84',
            success: options.success,
            fail: options.fail
        });
    },
    goToDetail: function (e) {
        var num = this.data.num;
        var dataset = app.getset(e);
        var status = dataset.status;
        var orderid = dataset.orderid;
        if (num != 6) {
            if (status == 1 || status == 2 || status == 3 || status == 4 || status == 5 || status == 6 || status == 7 || status == 8 || status == 9 || status == 10 || status == 11 || status == 12 || status == 27 || status == 40 || status == 41 || status == 42 || status == 43 || status == 44 || status == 45 || status == 46 || status == 47 || status == 48 || status == 49 || status == 50) {
                if (num == 1 || num == 3 || num == 4) {
                    var bindObj;
                    if (num == 1) {
                        bindObj = 0;
                    } else if (num == 3) {
                        var grade = dataset.grade;
                        if (grade == 0) {
                            bindObj = 6;
                        } else {
                            bindObj = 7;
                        }
                    } else if (num == 4) {
                        bindObj = 5;
                    }
                    var url = '/dianshang/orderDetail/orderDetail?orderId=' + orderid + '&bindObj=' + bindObj;
                    app.turnToPage(url);
                } else if (num == 2) {
                    var groupid = dataset.groupid;
                    var goodid = dataset.goodid;
                    var url = '/pintuan/groupGoodsorderdetails/groupGoodsorderdetails?orderId=' + orderid + '&groupid=' + groupid + '&goodid=' + goodid;
                    app.turnToPage(url);
                } else if (num == 5) {
                    var url = '/kanjia/pendingdelivery/pendingdelivery?orderid=' + orderid;
                    app.turnToPage(url);
                } else if (num == 7) {
                    var bindObj = dataset.bindobj;
                    var childid = dataset.childid;
                    var url = '/waimai/takeoutOrderDetail/takeoutOrderDetail?orderId=' + orderid + '&bindObj=' + bindObj + '&childid=' + childid;
                    app.turnToPage(url);
                } else if (num == 9) {
                    var url = '/yuyue/bespDetail/bespDetail?orderid=' + orderid;
                    app.turnToPage(url);
                }
            } else if (status == 13 || status == 14 || status == 17 || status == 18) {
                var cashtype;
                var selidx;
                if (status == 13 || status == 14) {
                    cashtype = 2;
                } else {
                    cashtype = 1;
                }
                if (status == 13 || status == 17) {
                    selidx = 2;
                } else {
                    selidx = 3;
                }
                var url = '/dianshang/cashRecord/cashRecord?cashtype=' + cashtype + '&selidx=' + selidx;
                app.turnToPage(url);
            } else if (status == 15 || status == 16) {
                var url = '/dianshang/newdisorder/newdisorder';
                app.turnToPage(url);
            } else if (status == 19) {
                var url = '/dianshang/rageDetail/rageDetail?selidx=2';
                app.turnToPage(url);
            } else if (status == 21 || status == 22 || status == 25 || status == 26) {
                var url = '/pages/iWantDis/iWantDis';
                app.turnToPage(url);
            } else if (status == 28 || status == 29 || status == 30) {
                var selidx;
                if (status == 28) {
                    selidx = 2;
                } else if (status == 29) {
                    selidx = 1;
                } else if (status == 30) {
                    selidx = 3;
                }
                var url = '/kanjia/hagglelist/hagglelist?selidx=' + selidx;
                app.turnToPage(url);
            } else if (status == 31 || status == 32 || status == 33) {
                this.getLocation({
                    success: function (res) {
                        var lat = res.latitude;
                        var lng = res.longitude;
                        var url = '/tongcheng/cityInfoDetail/cityInfoDetail?cid=' + orderid + '&lat=' + lat + '&lng=' + lng;
                        app.turnToPage(url);
                    }
                })
            } else if (status == 34 || status == 35) {
                var selidx;
                if (status == 34) {
                    selidx = 2;
                } else {
                    selidx = 3;
                }
                var url = '/tongcheng/rew_detail/rew_detail?selidx=' + selidx;
                app.turnToPage(url);
            } else if (status == 36 || status == 37 || status == 38 || status == 39) {
                var type = 0;
                if (status == 39) {
                    type = 2;
                }
                var url = '/tongcheng/myCitybox/myCitybox?type=' + type;
                app.turnToPage(url);
            } else if (status == 51 || status == 52 || status == 53 || status == 54 || status == 55 || status == 56 || status == 57) {
                var url = '/jiudian/hotelorderDetail/hotelorderDetail?orderid=' + orderid;
                app.turnToPage(url);
            }
        } else {
            if (status == 3 || status == 6 || status == 4 || status == 7) {
                var discardid = dataset.discardid;
                var type;
                if (status == 3 || status == 6) {
                    type = 1;
                } else {
                    type = 0;
                }
                var url = '/pages/newMemberDetail/newMemberDetail?type=' + type + '&discardid=' + discardid;
                app.turnToPage(url);
            } else if (status == 8 || status == 9) {
                var url = '/pages/sellerJoin/sellerJoin';
                app.turnToPage(url);
            }
        }
    }
})