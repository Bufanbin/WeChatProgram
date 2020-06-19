var WxParse = require('../../components/wxParse/wxParse.js');
var app = getApp();
var id, bindObj, sonid, isself, childid;
var specstr = '';
var initialdate = '';
var shareimg = '', sharetit = app.getAppTitle();
Page({
    havenums: 1,
    prenum: 0,
    pagenum: 2,
    data: {
        srcoll: 'auto',
        showDescPage: false,
        showParamPage: false,
        buynum: 1,
        needMoney: 0,
        surplus: 0,
        spec_id: 0,
        specstr: '',
        btnType: 0,
        businessStatus: 1,
        toappointment: true,
        longarray: [],
        slotarray: [],
        datearr: [],
        seltimeslot: [],
        commoditynum: 1,
        dateIndex: -1,
        timeIndex: 0,
        longindex: 0,
        slotindex: 0,
        evaluateType: [
            { name: '好评' },
            { name: '中评' },
            { name: '差评' },
            { name: '有图' }
        ],
        detailType: [
            { name: '商品详情' },
            { name: '商品属性' }
        ],
        detailstatus: 0,
        enter_type: 0,
        login_type: 0,
        showTip: false,
        tipText: '',
        showBg: false,
        showRed: false,
        isActivity: 0,
        activity_id: 0,
        red_full: 0,
        red_reduce: 0,
        code: 0,
        showFriends: false,
        compic: '',
        showShare: false,
        red_icon_pic: app.globalData.siteBaseUrl + '/static/user/images/red_icon.png',
        senior_icon4_pic: app.globalData.siteBaseUrl + '/static/user/images/senior_icon4.png',
        coupon_share_pic: app.globalData.siteBaseUrl + '/static/user/images/coupon_share.png',
        close_red_pic: app.globalData.siteBaseUrl + '/static/user/images/close_red.png',
        goodscoupon_pic: app.globalData.siteBaseUrl + '/static/user/images/goodscoupon.png',
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        var that = this;
        id = e.id;
        bindObj = e.bindObj || 0;
        sonid = e.sonid || 0;
        isself = e.isself || 0;
        childid = e.childid || 0;
        that.setData({
            bindObj: bindObj,
            childid: childid,
            id: id
        });
        var sWidth;
        wx.getSystemInfo({
            success: function (res) {
                sWidth = res.windowWidth - 20;
            }
        })
        let url = '';
        if (bindObj == 0) {
            url = '/webapp/goodDetail'
        } else if (bindObj == 1) {
            url = '/webapp/ordergoodDetail'
        } else if (bindObj == 2) {
            url = '/webapp/tostore_goods_detail'
        }
        app.sendRequest({
            url: url,
            data: {
                good_id: id,
                sonid: sonid,
                isself: isself,
                child_id: childid
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    if (!res.storeinfo) {
                        app.showModal({
                            content: '请先完善店铺信息',
                            confirm: function () {
                                app.turnBack();
                            }
                        })
                        return false;
                    }
                    if (res.login_type != 4) {
                        if (!res.postset) {
                            app.showModal({
                                content: '请先完善店铺海报',
                                confirm: function () {
                                    app.turnBack();
                                }
                            })
                            return false;
                        }
                    }
                    var article = res.goodinfo.details.toString();
                    article = article.replace(/px\)/g, '/320*' + sWidth + 'px)');
                    WxParse.wxParse('article', 'html', article, that, 5);
                    var newdata = {};
                    newdata['details'] = res.goodinfo.details;
                    newdata['carousel'] = res.goodinfo.carousel;
                    newdata['goodsName'] = res.goodinfo.goodname;
                    if (res.goodinfo.freighttype == 1) {
                        if (res.goodinfo.yf == 1) {
                            newdata['freight'] = '下单计算';
                        } else {
                            newdata['freight'] = '免运费';
                        }
                    } else {
                        newdata['freight'] = res.goodinfo.freight;
                    }
                    newdata['salenum'] = res.goodinfo.allSales;
                    newdata['evaluate.list'] = res.goodcomment;
                    newdata['evaluate.total'] = res.commentnum;
                    newdata['goodsPrice'] = res.oldprice;
                    newdata['goodsDiscount'] = res.price;
                    newdata['goodId'] = id;
                    newdata['goodattr'] = res.goodattr;
                    newdata['inventoryprice'] = res.inventoryprice;
                    newdata['inventory'] = res.inventory;
                    newdata['picpath'] = res.goodinfo.picpath;
                    newdata['isEvaluate'] = res.goodinfo.isEvaluate;
                    if (bindObj == 0) {
                        newdata['evaluateType[0].num'] = res.goodnum;
                        newdata['evaluateType[1].num'] = res.middlenum;
                        newdata['evaluateType[2].num'] = res.badnum;
                        newdata['evaluateType[3].num'] = res.picnum;
                        newdata['storeinfo'] = res.storeinfo || "";
                        newdata['allgoodsnum'] = res.all_goods_num;
                        newdata['enter_type'] = res.enter_type || "";
                        newdata['login_type'] = res.login_type || "";
                        if (res.share_tem.code == 1) {
                            sharetit = res.share_tem.tem_info.title;
                            shareimg = res.share_tem.tem_info.picpath;
                        }
                    }
                    var selectSpec = [];
                    var specstr = '';
                    if (bindObj != 1) {
                        for (var i = 0; i < res.goodspec.length; i++) {
                            var specOne = { name: res.goodspec[i].nameone, content: res.goodspec[i].two[0].nametwo };
                            selectSpec.push(specOne);
                            res.goodspec[i].two[0].select = true;
                            specstr += res.goodspec[i].nameone + ':' + res.goodspec[i].two[0].nametwo + ' ';
                        }
                        for (var i = 0; i < res.inventoryprice.length; i++) {
                            if (res.inventoryprice[i].spec_desc == specstr) {
                                newdata['needMoney'] = res.inventoryprice[i].price;
                                newdata['surplus'] = res.inventoryprice[i].inventory;
                                newdata['spec_id'] = res.inventoryprice[i].spec_id;
                            }
                        }
                    }
                    newdata['timelong'] = res.timelong || "";
                    newdata['timeslot'] = res.timeslot || "";
                    newdata['timetype'] = res.timetype || "";
                    newdata['goodspec'] = res.goodspec;
                    newdata['selectSpec'] = selectSpec;
                    newdata['pageshow'] = true;
                    newdata['specstr'] = specstr;
                    newdata['nothing'] = false;
                    newdata['storeSet'] = res.storeSet || "";
                    newdata['businessStatus'] = res.businessStatus || 1;
                    newdata['code'] = res.code;
                    if (bindObj == 0) {
                        newdata['recommendgoods'] = res.recommendgoods;
                        that.havenums = res.havenums;
                        var postset = res.postset;
                        var carpic = res.goodinfo.carousel[0].picpath;
                        var qrcodeurl = res.qrcodeurl;
                        var goodqrcode = res.goodQrcode;
                        var storelogo = res.storeinfo.logo;
                        var storename = res.storeinfo.storename;
                        var postpic = postset.background_pic;
                        newdata['postset'] = postset;
                        newdata['carpic'] = carpic;
                        newdata['qrcodeurl'] = qrcodeurl;
                        newdata['goodqrcode'] = goodqrcode;
                        newdata['storelogo'] = storelogo;
                        newdata['storename'] = storename;
                        newdata['postpic'] = postpic;
                    }
                    that.setData(newdata);
                    wx.setNavigationBarTitle({
                        title: res.goodinfo.goodname
                    })
                }
                if (res.code == 3) {
                    that.setData({
                        pageshow: true,
                        nothing: true,
                        businessStatus: 1
                    })
                    wx.setNavigationBarTitle({
                        title: '商品过期不存在'
                    })
                }
                if (res.code == 1000 || res.code == 2000) {
                    that.setData({
                        pageshow: true,
                        vqdlevel: res.code
                    })
                    wx.setNavigationBarTitle({
                        title: '待升级提示'
                    });
                }
            }
        });
        this.loadRedpackets();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    dataInitial: function () {
        initialdate = true;
    },
    onShareAppMessage: function () {
        var that = this;
        var pageRouter = this.page_router;
        that.shareRed();
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
            title: sharetit,
            imageUrl: shareimg,
            path: '/dianshang/goodsDetail/goodsDetail?id=' + id + '&childid=' + childid,
            success: function (res) {
            }
        }
    },
    chooseSpec: function () {
        this.setData({
            showDescPage: true,
            scroll: 'hidden',
            btnType: 0
        });
    },
    moreEvaluate: function () {
        var url = '/dianshang/goodsEvaluate/goodsEvaluate?id=' + id + '&bindObj=' + bindObj;
        app.turnToPage(url);
    },
    shopHomepage: function () {
        var enter_type = this.data.enter_type;
        var login_type = this.data.login_type;
        var url = '';
        if (enter_type == 2 && login_type == 3) {
            url = '/dianshang/shopHome/shopHome?childid=' + childid;
        } else if (enter_type == 3 && login_type == 4) {
            url = '/tongcheng/storeDetail/storeDetail?child_id=' + childid;
        }
        app.turnToPage(url);
    },
    closeSpec: function () {
        this.setData({
            showDescPage: false,
            scroll: 'auto'
        });
    },
    addShopCar: function () {
        var that = this;
        var spec_id = this.data.spec_id;
        var surplus = this.data.surplus;
        if (surplus <= 0) {
            app.toast({ title: '该规格商品库存不足' });
            return;
        }
        if (spec_id != 0) {
            var openid = app.getSessionKey();
            var specstr = this.data.specstr;
            var picpath = this.data.picpath;
            var goodname = this.data.goodsName;
            var price = this.data.needMoney;
            var nums = this.data.buynum;
            let url = "";
            if (bindObj == 0) {
                url = '/webapp/addShopcars'
            } else if (bindObj == 2) {
                url = '/webapp/add_tostore_shopcars'
            }
            app.sendRequest({
                url: url,
                method: 'post',
                data: {
                    good_id: id,
                    specstr: specstr,
                    picpath: picpath,
                    openid: openid,
                    goodname: goodname,
                    price: price,
                    nums: nums,
                    spec_id: spec_id,
                    sonid: sonid,
                    isself: isself
                },
                success: function (res) {
                    if (res.code == 1) {
                        app.toast({ title: '添加成功' });
                    } else if (res.code == 3) {
                        app.toast({ title: '库存不足' });
                    } else if (res.code == 4) {
                        app.toast({ title: '亲~该商品在购物车的数量已超过库存，无法再添加商品了，谢谢。' });
                    } else if (res.code == 5) {
                        app.toast({ title: res.msg });
                    } else {
                        app.toast({ title: '添加失败' });
                    }
                }
            })
        } else {
            app.toast({ title: '请先选择规格' });
        }
    },
    reducenum: function () {
        var buynum = this.data.buynum;
        if (buynum <= 1) {
            return;
        }
        buynum--;
        this.setData({
            buynum: buynum
        });
    },
    addnum: function () {
        var buynum = this.data.buynum;
        if (buynum >= 1000) {
            return;
        }
        buynum++;
        this.setData({
            buynum: buynum
        });
    },
    editnum: function (e) {
        var value = parseInt(e.detail.value);
        if (value > 1000) {
            value = 1000;
        }
        this.setData({
            buynum: value
        });
    },
    closeParamPage: function () {
        this.setData({
            showParamPage: false
        });
    },
    showParamPage: function () {
        this.setData({
            showParamPage: true
        });
    },
    backhome: function () {
        app.backhome();
    },
    previewPic: function (e) {
        var url = e.target.dataset.picpath;
        wx.previewImage({
            current: '',
            urls: url
        });
    },
    selectSpec: function (e) {
        var dataset = app.getset(e);
        var idx = dataset.idx;
        var tidx = dataset.tidx;
        var goodspec = this.data.goodspec;
        var selectSpec = this.data.selectSpec;
        var needMoney = 0;
        var surplus = 0;
        var spec_id = 0;
        var specstr = '';
        var inventoryprice = this.data.inventoryprice;
        if (!goodspec[idx].two[tidx].select) {
            for (var i = 0; i < goodspec[idx].two.length; i++) {
                if (i != tidx) {
                    goodspec[idx].two[i].select = false;
                }
            }
            goodspec[idx].two[tidx].select = true;
            selectSpec[idx].content = goodspec[idx].two[tidx].nametwo;
        }
        for (var i = 0; i < selectSpec.length; i++) {
            specstr += selectSpec[i].name + ':' + selectSpec[i].content + ' ';
        }
        for (var i = 0; i < inventoryprice.length; i++) {
            var spec_desc = inventoryprice[i].spec_desc;
            if (spec_desc == specstr) {
                needMoney = inventoryprice[i].price;
                surplus = inventoryprice[i].inventory;
                spec_id = inventoryprice[i].spec_id;
            }
        }
        this.setData({
            goodspec: goodspec,
            selectSpec: selectSpec,
            needMoney: needMoney,
            surplus: surplus,
            spec_id: spec_id,
            specstr: specstr
        })
    },
    showbuy: function () {
        this.setData({
            showDescPage: true,
            scroll: 'hidden',
            btnType: 1
        });
    },
    buynow: function (e) {
        let num = parseInt(app.getset(e).num);
        var that = this;
        var spec_id = this.data.spec_id;
        switch (num) {
            case 0:
                if (spec_id != 0) {
                    var openid = app.getSessionKey();
                    var specstr = this.data.specstr;
                    var nums = this.data.buynum;
                    app.sendRequest({
                        url: '/webapp/nowBuyGood',
                        method: 'post',
                        data: {
                            openid: openid,
                            specstr: specstr,
                            num: nums,
                            spec_id: spec_id,
                            good_id: id,
                            sonid: sonid,
                            isself: isself
                        },
                        success: function (res) {
                            if (res.code == 1) {
                                var caridOne = [];
                                var carid = [];
                                caridOne.push(res.carid);
                                carid.push(caridOne);
                                var caridArr = JSON.stringify(carid);
                                var childArr = [];
                                childArr.push(childid);
                                var childidArr = JSON.stringify(childArr);
                                var enter_type = that.data.enter_type;
                                var login_type = that.data.login_type;
                                var is_city = 0;
                                if (enter_type == 3 && login_type == 4) {
                                    is_city = 1;
                                }
                                var url = '/dianshang/createOrder/createOrder?carid=' + caridArr + '&bindObj=' + bindObj + '&childidArr=' + childidArr + '&is_city=' + is_city;
                                app.turnToPage(url);
                            } else if (res.code == 3) {
                                app.toast({ title: '商品数量不足' });
                            } else if (res.code == 5) {
                                app.toast({ title: res.msg });
                            }
                        }
                    })
                } else {
                    app.toast({ title: '请先选择规格' });
                }
                break;
            case 1:
                var openid = app.getSessionKey();
                var specstr = this.data.specstr;
                var nums = this.data.commoditynum;
                var price = this.data.appointmentdata.price;
                var totalprice = this.data.appointmentdata.totalprice;
                var inventory = this.data.appointmentdata.inventory;
                var ordertime = this.data.appointmentdata.ordertime;
                var timelong = this.data.longarray[this.data.longindex];
                var nickname = this.data.userInfo.nickName;
                app.sendRequest({
                    url: '/webapp/ordergoods_order',
                    method: 'post',
                    data: {
                        openid: openid,
                        specstr: specstr,
                        nums: nums,
                        good_id: id,
                        price: price,
                        totalprice: totalprice,
                        inventory: inventory,
                        ordertime: ordertime,
                        timelong: timelong,
                        nickname: nickname,
                        sonid: sonid,
                        isself: isself
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            var url = '/dianshang/createOrder/createOrder?orderid=' + res.order_id + '&bindObj=' + bindObj;
                            app.turnToPage(url);
                        } else {
                            app.toast({ title: res.msg });
                        }
                    }
                })
                break;
            case 2:
                if (spec_id != 0) {
                    var openid = app.getSessionKey();
                    var specstr = this.data.specstr;
                    var nums = this.data.buynum;
                    app.sendRequest({
                        url: '/webapp/tostore_now_buy',
                        method: 'post',
                        data: {
                            openid: openid,
                            specstr: specstr,
                            num: nums,
                            spec_id: spec_id,
                            good_id: id
                        },
                        success: function (res) {
                            if (res.code == 1) {
                                var url = '/dianshang/settlement/settlement?carid=' + res.carid;
                                app.turnToPage(url);
                            } else if (res.code == 3) {
                                app.toast({ title: '商品数量不足' });
                            } else if (res.code == 5) {
                                app.toast({ title: res.msg });
                            }
                        }
                    })
                } else {
                    app.toast({ title: '请先选择规格' });
                }
                break;
        }
    },
    goToShopCats: function () {
        var url = '/pages/shopCart/shopCart';
        var tabBarPagePathArr = app.globalData.tabBarPagePathArr;
        if (tabBarPagePathArr.indexOf(url) != -1) {
            app.switchToTab(url);
        } else {
            app.turnToPage(url);
        }
    },
    bindLongChange: function (e) {
        this.setData({
            longindex: e.detail.value
        });
        this.loadOrdergood();
    },
    bindSlotChange: function (e) {
        this.setData({
            slotindex: e.detail.value
        });
        this.loadOrdergood();
    },
    showappointment: function (e) {
        var that = this;
        app.sendRequest({
            url: '/webapp/order_goods',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                good_id: id
            },
            success: function (res) {
                var arr = [];
                that.setData({
                    toappointment: false,
                    appointmentdata: res,
                    seltimeslot: res.seltimeslot,
                    longarray: res.timelong,
                    slotarray: res.timeslot
                });
                var str = res.days;
                var noopen = false;
                for (var i = 0; i < str.length; i++) {
                    if (str[i].indexOf('不营业') > 0) {
                        noopen = true;
                    } else if (initialdate) {
                        initialdate = false;
                        that.setData({
                            dateIndex: i
                        })
                    }
                    that.setData({
                        days: {
                            'week': str[i].substr(0, 2),
                            'date': str[i].substr(str[i].length - 6, str[i].length),
                            'noopen': noopen
                        }
                    })
                    arr.push(that.data.days);
                    noopen = false;
                }
                if (res.type == 1) {
                    specstr = '时长:' + that.data.longarray[that.data.longindex] + ' ' + that.data.appointmentdata.timetypestr;
                } else {
                    specstr = '时长:' + that.data.longarray[that.data.longindex] + ' 时段:' + that.data.slotarray[that.data.slotindex] + ' ' + that.data.appointmentdata.timetypestr;
                }
                that.setData({
                    datearr: arr,
                    specstr: specstr
                })
            }
        })
    },
    changeNum: function (e) {
        var num = app.getset(e).num;
        var commoditynum = this.data.commoditynum;
        var that = this;
        if (num == 0) {
            if (commoditynum <= 1) {
                return;
            }
            commoditynum--;
            that.setData({
                commoditynum: commoditynum
            });
        } else if (num == 1) {
            if (commoditynum >= 1000) {
                return;
            }
            commoditynum++;
            that.setData({
                commoditynum: commoditynum
            });
        }
        this.loadOrdergood();
    },
    appointNum: function (e) {
        var value = parseInt(e.detail.value);
        if (value > 1000) {
            value = 1000;
        }
        this.setData({
            commoditynum: value
        });
        this.loadOrdergood();
    },
    changeDate: function (e) {
        var index = app.getset(e).index;
        var num = app.getset(e).num;
        var text = app.getset(e).text;
        if (num == '0') {
            this.setData({
                dateIndex: index,
                dateText: text
            });
            this.loadOrdergood();
        }
    },
    changeTime: function (e) {
        var index = e.target.dataset.index;
        var text = app.getset(e).text;
        this.setData({
            timeIndex: index,
            timeText: text
        });
        this.loadOrdergood();
    },
    loadOrdergood: function (e) {
        var that = this;
        var timelong = this.data.longarray[this.data.longindex];
        var timeslot = this.data.slotarray[this.data.slotindex];
        var chodate = this.data.dateText;
        var ordertime = this.data.appointmentdata.alltime[this.data.dateIndex];
        var fulldate = ordertime.split('-');
        var full_chodate = '';
        for (var i = 0; i < fulldate.length; i++) {
            full_chodate += fulldate[i];
        }
        var chotimeslot = this.data.timeText;
        if (this.data.appointmentdata.type == 1) {
            specstr = '时长:' + timelong + ' ' + this.data.appointmentdata.timetypestr;
        } else {
            specstr = '时长:' + timelong + ' 时段:' + timeslot + ' ' + this.data.appointmentdata.timetypestr;
        }
        var nums = this.data.commoditynum;
        this.setData({
            specstr: specstr
        })
        app.sendRequest({
            url: '/webapp/order_goods',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                good_id: id,
                specstr: specstr,
                timelong: timelong,
                timeslot: timeslot,
                chodate: chodate,
                full_chodate: full_chodate,
                ordertime: ordertime,
                chotimeslot: chotimeslot,
                nums: nums
            },
            success: function (res) {
                that.setData({
                    appointmentdata: res,
                    seltimeslot: res.seltimeslot
                })
            }
        })
    },
    loadmoreRmd: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadRmdData();
        }
    },
    loadRmdData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        var status = this.data.selectIdx - 1;
        app.sendRequest({
            url: '/webapp/recommend',
            method: 'post',
            data: {
                pageNum: pagenum,
                good_id: id,
                sonid: sonid,
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.recommendgoods;
                    newdata['recommendgoods'] = oldList.concat(res.recommendgoods);
                    that.setData(newdata);
                }
            }
        })
    },
    gotoRecommend: function (e) {
        var rid = app.getset(e).rid;
        var url = '/dianshang/goodsDetail/goodsDetail?id=' + rid + '&bindObj=' + bindObj + '&sonid=' + sonid + '&isself=' + isself + '&childid=' + childid;
        app.turnToPage(url);
    },
    chooseDetail: function (e) {
        var index = app.getset(e).index;
        if (index != this.data.detailstatus) {
            this.setData({
                detailstatus: index
            })
        }
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    loadRedpackets: function () {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/newapp/reShareStatus',
            data: {
                openid: openid,
                child_id: childid
            },
            method: 'post',
            success: function (res) {
                var newdata = {};
                newdata['isActivity'] = res.code;
                newdata['activity_id'] = res.activity_id;
                that.setData(newdata);
            }
        });
    },
    shareRed: function (e) {
        var that = this;
        var openid = app.getSessionKey();
        var activity_id = this.data.activity_id;
        var isActivity = this.data.isActivity;
        if (!this.data.userInfo.avatarUrl) {
            return;
        }
        app.sendRequest({
            url: '/newapp/getShareCoup',
            data: {
                openid: openid,
                activity_id: activity_id
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    if (isActivity == 1) {
                        var newdata = {};
                        newdata['red_full'] = res.full;
                        newdata['red_reduce'] = res.reduce;
                        newdata['showBg'] = true;
                        newdata['showRed'] = true;
                        that.setData(newdata)
                    }
                }
            }
        });
    },
    closeRed: function (e) {
        this.setData({
            showBg: false,
            showRed: false
        })
    },
    openShare: function (e) {
        this.setData({
            showShare: true
        })
    },
    closenewgift: function () {
        app.closenewgift();
    },
    openImg: function (e) {
        var img = app.getset(e).img;
        var carousel = this.data.carousel;
        var urls = [];
        for (var i = 0; i < carousel.length; i++) {
            urls.push(carousel[i].picpath);
        }
        wx.previewImage({
            current: img,
            urls: urls,
        })
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    }
})