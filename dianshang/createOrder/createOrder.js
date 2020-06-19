var app = getApp();
var carid, bindObj, orderId, childidArr, is_city;
var disopenid = 0;
var paysubmit = false;
Page({
    code: 1,
    data: {
        user_inte: false,
        addressid: 0,
        addrIdx: 0,
        selidx: -1,
        remark: '',
        showRemark: false,
        paywayArr: ['在线支付', '货到付款'],
        selpayway: 0,
        couponlist: [],
        mycard: '',
        is_discount: 0,
        is_stored: 0,
        use_card: 1,
        memreduce: 0,
        showTip: false,
        storebalance: 0,
        premark: '',
        payIdx: 0,
        pickIdx: 0,
        cardIdx: -1,
        selCard: -1,
        cardText: '',
        discardinfo: '',
        storedcardinfo: '',
        is_black: 0,
        couponArr: [],
        allPrice: 0,
        allreduce: 0,
        allfreight: '',
        orderList: [],
        selget: 1,
        uname: '',
        uphone: '',
        storeinfo: {},
        seckremark: '',
        get_deliver: 0,
        get_self: 0,
        coupontype_pic1: app.globalData.siteBaseUrl + '/static/user/images/coupontype1.png',
        coupontype_pic2: app.globalData.siteBaseUrl + '/static/user/images/coupontype2.png',
        coupontype_pic3: app.globalData.siteBaseUrl + '/static/user/images/coupontype3.png',
        signclose_pic: app.globalData.siteBaseUrl + '/static/user/images/signclose.png',
        seckaddr_border_pic: app.globalData.siteBaseUrl + '/static/user/images/seckaddr_border.png',
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        bindObj = e.bindObj;
        if (bindObj == 1) {
            orderId = e.orderid;
        } else {
            if (bindObj == 6 || bindObj == 7) {
                disopenid = app.globalData.disopenid;
            }
            carid = e.carid;
            is_city = e.is_city || 0;
            childidArr = JSON.parse(e.childidArr);
        }
        this.setData({
            bindObj: bindObj
        })
    },
    dataInitial: function () {
    },
    onShow: function () {
        app.setPageUserInfo();
        this.loadData();
        var animation = wx.createAnimation({
            duration: 200,
        })
        this.animation = animation;
    },
    loadData: function () {
        var that = this;
        if (bindObj == 1) {
            app.sendRequest({
                url: '/webapp/cre_ordersgoods',
                method: 'post',
                data: {
                    openid: app.getSessionKey(),
                    order_id: orderId,
                    addressid: that.data.addressid
                },
                success: function (res) {
                    if (res.code == 1) {
                        that.setData({
                            orderList: res.goodlist,
                            address: res.address,
                            loaded: true,
                            total: res.totalnum,
                            freight: res.freight,
                            balance: res.totalprice,
                        });
                    }
                }
            })
        } else {
            var url = '';
            if (bindObj == 7) {
                url = '/disweb/creatOrders';
            } else {
                url = '/newapp/newds_creatOrders';
            }
            var couponArr;
            var use_card;
            if (bindObj == 0 || bindObj == 6 || bindObj == 7) {
                couponArr = this.data.couponArr;
                use_card = this.data.use_card;
            }
            var useintegral = 0;
            if (this.data.user_inte) {
                useintegral = 1;
            }
            var remarksArr = [];
            var glist = this.data.orderList;
            for (var i = 0; i < glist.length; i++) {
                var grmark = '';
                if (glist[i][0].remark) {
                    var grmark = glist[i][0].remark;
                }
                remarksArr.push(grmark);
            }
            var is_self;
            if (bindObj == 5 || bindObj == 0) {
                is_self = this.data.selget - 1;
            }
            app.sendRequest({
                url: url,
                method: 'post',
                data: {
                    openid: app.getSessionKey(),
                    caridArr: carid,
                    bindObj: bindObj,
                    addressid: that.data.addressid,
                    use_card: use_card,
                    useintegral: useintegral,
                    childidArr: childidArr,
                    couponArr: couponArr,
                    remarksArr: remarksArr,
                    is_city: is_city,
                    is_self: is_self
                },
                success: function (res) {
                    if (res.code == 1 || res.code == 3) {
                        var couponArr = [];
                        var needaddress = res.needaddress;
                        if (bindObj == 0 || bindObj == 6 || bindObj == 7) {
                            for (let i1 = 0; i1 < res.couponid.length; i1++) {
                                couponArr.push(res.couponid[i1]);
                                if (res.couponid[i1]) {
                                    for (var i2 = 0; i2 < res.couponlist[i1].length; i2++) {
                                        if (res.couponlist[i1][i2].id == res.couponid[i1]) {
                                            var coureduce = res.couponlist[i1][i2].reduce;
                                            res.goodslist[i1][0].couponIdx = i2;
                                            res.goodslist[i1][0].selCoupon = i2;
                                            res.goodslist[i1][0].couponText = '-￥' + coureduce;
                                            break;
                                        }
                                    }
                                } else {
                                    res.goodslist[i1][0].couponIdx = -1;
                                    res.goodslist[i1][0].selCoupon = -1;
                                    res.goodslist[i1][0].couponText = '';
                                }
                            }
                        }
                        var selpayway = that.data.payIdx;
                        if (res.new_payway != 2) {
                            selpayway = res.new_payway;
                        }
                        var mycard = res.myCard;
                        var is_discount = 0;
                        var is_stored = 0;
                        var memreduce = 0;
                        var storebalance = 0;
                        var is_black = 0;
                        if (mycard) {
                            is_discount = mycard.is_discount;
                            is_stored = mycard.is_stored;
                            memreduce = res.memreduce;
                            storebalance = mycard.balance;
                            is_black = mycard.is_black;
                            if (that.data.selCard == 1 && is_discount == 1 && is_black == 0) {
                                var cardText = '折扣卡（-￥' + memreduce + '）';
                                that.setData({
                                    cardText: cardText
                                })
                            }
                        }
                        if (bindObj == 4 || bindObj == 5 || bindObj == 0) {
                            var selget = that.data.selget;
                            if (res.new_sendway != 2) {
                                selget = res.new_sendway + 1;
                            }
                            if (res.new_sendway == 1 || selget == 2) {
                                needaddress = 0;
                            }
                            that.setData({
                                selget: selget,
                                new_sendway: res.new_sendway,
                                new_payway: res.new_payway,
                            })
                        }
                        if (res.use_card == 0) {
                            var cardIdx = -1;
                            var cardText = '';
                            var selCard = -1;
                        } else if (res.use_card == 1) {
                            var cardIdx = 1;
                            var cardText = '折扣卡（-￥' + res.memreduce + '）';
                            var selCard = 1;
                        } else {
                            var cardIdx = 0;
                            var cardText = '储值卡';
                            var selCard = 0;
                        }
                        that.setData({
                            payway: res.new_payway,
                            selpayway: selpayway,
                            orderList: res.goodslist,
                            balance: res.totalprice.toFixed(2),
                            address: res.address,
                            total: res.totalnum,
                            freight: res.freight,
                            dedmoney: res.dedmoney,
                            dedintegral: res.dedintegral,
                            loaded: true,
                            reduce: res.reduce,
                            memreduce: res.memreduce,
                            exmoney: res.exmoney,
                            useintegral: res.useintegral,
                            needaddress: needaddress,
                            couponlist: res.couponlist,
                            mycard: mycard,
                            is_discount: is_discount,
                            is_stored: is_stored,
                            storebalance: storebalance,
                            discardinfo: res.discardinfo,
                            storedcardinfo: res.storedcardinfo,
                            is_black: is_black,
                            allPrice: res.allPrice,
                            allreduce: res.allreduce,
                            allfreight: res.allfreight,
                            couponArr: couponArr,
                            storeinfo: res.storeinfo,
                            use_card: res.use_card,
                            cardIdx: cardIdx,
                            cardText: cardText,
                            selCard: selCard,
                            uname: res.userInfo.username,
                            uphone: res.userInfo.telnum,
                        });
                    }
                }
            })
        }
    },
    submitOrder: function () {
        var that = this;
        var address = this.data.address;
        var user_inte = this.data.user_inte;
        var errmsg = '';
        if (user_inte) {
            var is_use = 1;
        } else {
            var is_use = 0;
        }
        if (bindObj == 1) {
            if (paysubmit) {
                return;
            }
            paysubmit = true;
            app.sendRequest({
                url: '/webapp/sub_ordergoods_order',
                method: 'post',
                data: {
                    consignee: address.consignee,
                    telphone: address.telphone,
                    address: address.province + address.city + address.county + address.street,
                    order_id: orderId
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
                                that.goToOrderDetail(res.orderid);
                            }
                        })
                    } else if (res.code == 3) {
                        paysubmit = false;
                        app.toast({ title: '亲~当前无法支付，你支付的订单中某个商品库存不足， 请重新下单，谢谢。' });
                    } else if (res.code == 4) {
                        paysubmit = false;
                        app.showModal({
                            content: '商家未添加支付，暂时无法支付',
                            confirm: function () {
                                that.goToOrderDetail(res.orderid);
                            }
                        })
                    } else if (res.code == 5) {
                        paysubmit = false;
                        app.showModal({
                            content: res.payinfo.msg,
                            confirm: function () {
                                that.goToOrderDetail(res.orderid);
                            }
                        })
                    } else if (res.code == 6 || res.code == 7 || res.code == 2) {
                        paysubmit = false;
                        app.showModal({
                            content: res.msg,
                        })
                    }
                }
            })
        } else {
            if (this.code == 3) {
                app.toast({ title: '该地址不在配送范围内' });
                return false;
            }
            var couponArr;
            var is_usevip;
            if (bindObj == 0) {
                var url = "/newapp/newds_submitOrder";
                couponArr = this.data.couponArr;
                is_usevip = this.data.use_card;
            } else if (bindObj == 6 || bindObj == 7) {
                couponArr = this.data.couponArr;
                is_usevip = this.data.use_card;
                var url = "";
                if (bindObj == 7) {
                    url = "/disweb/submitOrder";
                } else {
                    url = "/newapp/ds_submitOrder";
                }
            } else if (bindObj == 4) {
                var url = "/seck/submitOrder";
            } else if (bindObj == 5) {
                var url = "/seck/newsubmitOrder";
            }
            var remarksArr = [];
            if (bindObj == 5) {
                remarksArr.push(this.data.seckremark);
            } else {
                var glist = this.data.orderList;
                for (var i = 0; i < glist.length; i++) {
                    var grmark = '';
                    if (glist[i][0].remark) {
                        var grmark = glist[i][0].remark;
                    }
                    remarksArr.push(grmark);
                }
            }
            var saddress = '';
            var consignee = '';
            var telphone = '';
            var city = '';
            var province = '';
            var needaddress = 0;
            if (this.data.needaddress) {
                saddress = address.province + address.city + address.county + address.street;
                city = address.city;
                province = address.province;
                consignee = address.consignee;
                telphone = address.telphone;
                needaddress = 1;
            }
            var is_self = 0;
            if (bindObj == 5 || bindObj == 0) {
                var selget = this.data.selget;
                is_self = selget - 1;
                if (selget == 2) {
                    consignee = this.data.uname;
                    telphone = this.data.uphone;
                    if (!consignee) {
                        app.toast({ title: '亲-请完善提件人姓名' });
                        return;
                    }
                    if (!telphone) {
                        app.toast({ title: '亲-请完善提件人电话' });
                        return;
                    }
                    var reg = /^1[3|4|5|6|7|8]\d{9}$/;
                    if (!reg.test(telphone)) {
                        app.toast({ title: '亲-你填写的提件人电话格式有误，谢谢。' });
                        return;
                    }
                }
            }
            var payway = this.data.selpayway;
            if (paysubmit) {
                return;
            }
            paysubmit = true;
            app.sendRequest({
                url: url,
                method: 'post',
                data: {
                    openid: app.getSessionKey(),
                    consignee: consignee,
                    telphone: telphone,
                    address: saddress,
                    caridArr: carid,
                    nickname: that.data.userInfo.nickName,
                    is_use: is_use,
                    needaddress: needaddress,
                    remarksArr: remarksArr,
                    bindObj: bindObj,
                    disopenid: disopenid,
                    city: city,
                    province: province,
                    payway: payway,
                    is_usevip: is_usevip,
                    couponArr: couponArr,
                    childidArr: childidArr,
                    is_city: is_city,
                    is_self: is_self,
                    sendway: is_self
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
                                errmsg = data.errMsg;
                                that.sendNotice(res.payinfo.package, res.orderid, errmsg, 2);
                                that.goToOrderDetail(res.orderid);
                            }
                        })
                    } else if (res.code == 2) {
                        paysubmit = false;
                        var text = ''
                        if (res.is_end == 2) {
                            text = '亲-该商品秒杀时间已到，无法付款，谢谢。';
                        } else if (res.is_end == 3) {
                            text = '商品已售罄';
                        } else {
                            text = '网络错误，请重试！';
                        }
                        app.toast({ title: text });
                    } else if (res.code == 3) {
                        paysubmit = false;
                        app.toast({ title: '亲~当前无法支付，你支付的订单中某个商品库存不足， 请重新下单，谢谢。' });
                    } else if (res.code == 4) {
                        paysubmit = false;
                        app.showModal({
                            content: '商家未添加支付，暂时无法支付',
                            confirm: function () {
                                that.goToOrderDetail(res.orderid);
                            }
                        })
                    } else if (res.code == 5 || res.code == 8) {
                        paysubmit = false;
                        app.showModal({
                            content: res.msg,
                            confirm: function () {
                                that.goToOrderDetail(res.orderid);
                            }
                        })
                    } else if (res.code == 6 || res.code == 7 || res.code == 13) {
                        paysubmit = false;
                        app.showModal({
                            content: res.msg,
                            confirm: function () {
                                if (res.code == 13) {
                                    that.goToOrderDetail(res.orderid);
                                }
                            }
                        })
                    } else if (res.code == 100) {
                        paysubmit = false;
                        that.goToOrderDetail(res.orderid);
                    }
                }
            })
        }
    },
    goToOrderDetail: function (orderId) {
        var url = '';
        if (bindObj == 5) {
            url = '/dianshang/myseckOrder/myseckOrder';
        } else if (bindObj == 7) {
            url = '/dianshang/mydisOrder/mydisOrder';
        } else {
            var selget = this.data.selget;
            var is_self = selget - 1;
            url = '/pages/myOrder/myOrder?is_city=' + is_city + '&isself=' + is_self;
        }
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
    sel_integarl: function (e) {
        var that = this;
        var user_inte = this.data.user_inte;
        user_inte = !user_inte;
        this.setData({
            user_inte: user_inte
        })
        this.loadData();
    },
    integral_rule: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/integralRule',
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        showBg: true,
                        showrulePage: true,
                        rule: res.rule
                    });
                } else {
                    app.toast({ title: '暂无积分规则' });
                }
            }
        })
    },
    closeRule: function (e) {
        this.setData({
            showBg: false,
            showrulePage: false
        })
    },
    sendNotice: function (formid, orderid, errmsg, status) {
        if (bindObj == 7) {
            var newurl = "/disweb/sendNotice";
        } else {
            var newurl = "/webapp/sendNotice";
        }
        app.sendRequest({
            url: newurl,
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
        if (bindObj == 5) {
            var remark = this.data.seckremark;
        } else {
            var gdata = this.data.orderList;
            var remark = gdata[idx][0].remark || '';
        }
        this.setData({
            selidx: idx,
            showRemark: true,
            remark: remark,
            premark: remark
        })
    },
    enterEval: function (e) {
        var reg = /(\r\n)|(\n)/g;
        var val = e.detail.value;
        var selidx = this.data.selidx;
        if (reg.test(val)) {
            if (bindObj == 5) {
                var remark = this.data.seckremark + '，';
                this.setData({
                    premark: remark,
                    seckremark: remark
                })
            } else {
                var remark = this.data.orderList[selidx][0].remark + '，';
                this.setData({
                    premark: remark,
                    [`orderList[${selidx}][0].remark`]: remark
                })
            }
            return false;
        }
        if (bindObj == 5) {
            this.setData({
                seckremark: val
            })
        } else {
            this.setData({
                [`orderList[${selidx}][0].remark`]: val
            })
        }
    },
    confirmRemark: function () {
        this.setData({
            selidx: -1,
            showRemark: false,
            remark: ''
        })
    },
    paytypeSel: function (e) {
        var val = e.detail.value;
        this.setData({
            selpayway: val,
            payIdx: val
        });
    },
    openPicker: function (e) {
        var num = app.getset(e).num;
        this.setData({
            showBg: true,
            pickIdx: num
        })
        this.animation.bottom('0rpx').step();
        if (num == 1) {
            this.setData({
                card_cartanimate: this.animation.export()
            })
        } else if (num == 2) {
            var oindex = app.getset(e).oindex;
            var orderList = this.data.orderList;
            orderList[oindex][0].coupon_cartanimate = this.animation.export();
            this.setData({
                orderList: orderList,
                selidx: oindex
            })
        }
    },
    selItem: function (e) {
        var dataset = app.getset(e);
        var index = dataset.index;
        var pickIdx = this.data.pickIdx;
        var that = this;
        if (pickIdx == 1) {
            if (index == 0) {
                if (this.data.is_black == 1) {
                    app.openTip('黑名单用户不能使用储值卡');
                    return false;
                }
                if (this.data.is_stored == 0 || !this.data.mycard) {
                    app.openTip('您还没有充值储值卡，请立即充值');
                    return false;
                }
                var storebalance = parseFloat(this.data.storebalance);
                var allPrice = parseFloat(this.data.allPrice);
                if (storebalance < allPrice) {
                    app.openTip('储值卡余额不足，请使用微信支付');
                    return false;
                }
            } else if (index == 1) {
                if (this.data.is_discount == 0 || !this.data.mycard) {
                    app.openTip('您还没有开通折扣卡，请立即开通');
                    return false;
                }
                if (this.data.is_black == 1) {
                    app.openTip('黑名单用户不能使用折扣卡');
                    return false;
                }
            }
            this.setData({
                cardIdx: index
            })
        } else if (pickIdx == 2) {
            var oindex = dataset.oindex;
            var orderList = this.data.orderList;
            var opencla = dataset.opencla;
            var goodsnid = dataset.goodsnid;
            if (opencla == 1 && goodsnid) {
                var goodidArr = [];
                for (var i = 0; i < orderList[oindex].length; i++) {
                    goodidArr.push(orderList[oindex][i].good_id);
                }
                app.sendRequest({
                    url: '/webapp/coupon_classify',
                    method: 'post',
                    data: {
                        goodidArr: goodidArr,
                        goodsnid: goodsnid,
                        childidArr: childidArr
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            orderList[oindex][0].couponIdx = index;
                            that.setData({
                                orderList: orderList,
                                selidx: oindex
                            })
                        } else {
                            app.showModal({
                                content: res.msg
                            })
                        }
                    }
                })
            } else {
                orderList[oindex][0].couponIdx = index;
                this.setData({
                    orderList: orderList,
                    selidx: oindex
                })
            }
        }
    },
    sureItem: function (e) {
        var pickIdx = this.data.pickIdx;
        if (pickIdx == 1) {
            var cardIdx = this.data.cardIdx;
            if (cardIdx != this.data.selCard) {
                var cardText = '';
                var use_card = 0;
                if (cardIdx == 1) {
                    var memreduce = this.data.memreduce;
                    cardText = '折扣卡（-￥' + memreduce + '）';
                    use_card = 1;
                } else if (cardIdx == 0) {
                    cardText = '储值卡';
                    use_card = 2;
                }
                this.setData({
                    selCard: cardIdx,
                    cardText: cardText,
                    use_card: use_card
                });
                this.loadData();
            }
        } else if (pickIdx == 2) {
            var selidx = this.data.selidx;
            var orderList = this.data.orderList;
            var couponlist = this.data.couponlist;
            var couponIdx = orderList[selidx][0].couponIdx;
            var selCoupon = orderList[selidx][0].selCoupon;
            if (couponIdx != selCoupon) {
                var couponArr = this.data.couponArr;
                orderList[selidx][0].selCoupon = couponIdx;
                if (couponIdx != -1) {
                    var coureduce = couponlist[selidx][couponIdx].reduce;
                    var couponid = couponlist[selidx][couponIdx].id;
                    orderList[selidx][0].couponText = '-￥' + coureduce;
                    couponArr.splice(selidx, 1, couponid);
                } else {
                    orderList[selidx][0].couponText = '';
                    couponArr.splice(selidx, 1, '');
                }
                this.setData({
                    orderList: orderList,
                    couponArr: couponArr
                })
                this.loadData();
            }
        }
        this.hidePicker();
    },
    hidePicker: function (e) {
        var pickIdx = this.data.pickIdx;
        this.animation.bottom('-670rpx').step();
        if (pickIdx == 1) {
            this.setData({
                card_cartanimate: this.animation.export()
            })
        } else if (pickIdx == 2) {
            var orderList = this.data.orderList;
            orderList[this.data.selidx][0].coupon_cartanimate = this.animation.export();
            this.setData({
                orderList: orderList,
                selidx: -1
            })
        }
        this.setData({
            showBg: false,
            pickIdx: 0
        })
    },
    cancelPicker: function (e) {
        var cardIdx = this.data.selCard;
        var selidx = this.data.selidx;
        var orderList = this.data.orderList;
        if (selidx != -1) {
            this.setData({
                cardIdx: cardIdx,
                orderList: orderList
            })
        }
        this.hidePicker();
    },
    gotoMember: function (e) {
        this.cancelPicker();
        var type = app.getset(e).type;
        if (type == 0) {
            if (!this.data.discardinfo) {
                app.openTip('暂未设置');
                return false;
            }
            var discardid = this.data.discardinfo.id;
        } else if (type == 1) {
            if (!this.data.storedcardinfo) {
                app.openTip('暂未设置');
                return false;
            }
            var discardid = this.data.storedcardinfo.id;
        }
        var url = '/pages/newMemberDetail/newMemberDetail?type=' + type + '&discardid=' + discardid;
        app.turnToPage(url);
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
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
    closenewgift: function () {
        app.closenewgift();
    }
})