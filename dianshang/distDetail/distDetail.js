var WxParse = require('../../components/wxParse/wxParse.js');
var app = getApp();
var id, disopenid, disgrade, childid, sonid, isself, dis_userid;
var specstr = '';
var initialdate = '';
var sWidth;
var dopenid = '';
var num;
var nickname = '';
var avatar = '';
var shareimg = '', sharetit = app.getAppTitle();
Page({
    havenums: 1,
    prenum: 0,
    pagenum: 2,
    qrpath: '',
    timer: null,
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
        sonid: 0,
        isself: 0,
        disgrade: 0,
        showBackground: false,
        bgstyle: {},
        qrcodestyle: {},
        qrcodeimg: '',
        is_show: 0,
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
        isNew: false,
        rate: 0,
        commission: 0,
        showShare: false,
        showFriends: false,
        loadSharePic: false,
        compic: '',
        distributor: 0,
        style_type: 0,
        carpic: '',
        goodqrcode: '',
        qrcodeurl: '',
        storelogo: '',
        code: 0,
        senior_icon4_pic: app.globalData.siteBaseUrl + '/static/user/images/senior_icon4.png',
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        id = e.id;
        childid = e.childid || 0;
        num = e.num || 0;
        sonid = e.sonid || 0;
        isself = e.isself || 0;
        if (num == 1) {
            this.setData({
                isNew: true
            })
        }
        if (e.disopenid) {
            app.globalData.isShare = true;
            app.globalData.disopenid = e.disopenid;
        }
        if (!app.globalData.isShare && !app.globalData.isScan) {
            app.globalData.disopenid = app.getSessionKey();
        }
        disopenid = app.globalData.disopenid;
        disgrade = e.disgrade;
        wx.getSystemInfo({
            success: function (res) {
                sWidth = res.windowWidth - 20;
            }
        })
        this.setData({
            disgrade: disgrade,
            childid: childid,
            sonid: sonid,
            isself: isself
        })
        var that = this;
        this.timer = setInterval(function () {
            if (app.getSessionKey()) {
                that.loaddata();
                clearInterval(that.timer);
            }
        }, 50);
    },
    onHide: function () {
        clearInterval(this.timer);
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    dataInitial: function () {
        initialdate = true;
    },
    loaddata: function () {
        var that = this;
        var url = '';
        if (num == 0) {
            url = '/disgoods/dis_good_detail';
        } else {
            url = '/disweb/newdis_good_detail'
        }
        var openid = app.getSessionKey();
        app.sendRequest({
            url: url,
            data: {
                good_id: id,
                disopenid: disopenid,
                openid: openid,
                child_id: childid
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    if (res.share_tem.code == 1) {
                        sharetit = res.share_tem.tem_info.title;
                        shareimg = res.share_tem.tem_info.picpath;
                    }
                    var article = res.goodinfo.details.toString();
                    article = article.replace(/px\)/g, '/320*' + sWidth + 'px)');
                    WxParse.wxParse('article', 'html', article, that, 5);
                    var newdata = {};
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
                    newdata['goodsPrice'] = '￥' + res.oldprice;
                    newdata['goodsDiscount'] = '￥' + res.price;
                    newdata['newgoodsDiscount'] = res.price;
                    newdata['goodId'] = id;
                    newdata['goodattr'] = res.goodattr;
                    newdata['inventoryprice'] = res.inventoryprice;
                    newdata['inventory'] = res.inventory;
                    newdata['picpath'] = res.goodinfo.picpath;
                    newdata['isEvaluate'] = res.goodinfo.isEvaluate;
                    newdata['is_show'] = res.is_show || 0;
                    newdata['evaluateType[0].num'] = res.goodnum;
                    newdata['evaluateType[1].num'] = res.middlenum;
                    newdata['evaluateType[2].num'] = res.badnum;
                    newdata['evaluateType[3].num'] = res.picnum;
                    newdata['isSame'] = res.show_com_type;
                    if (!res.storeInfo) {
                        app.showModal({
                            content: '请先完善店铺信息',
                            confirm: function () {
                                app.turnBack();
                            }
                        })
                        return false;
                    }
                    newdata['storeinfo'] = res.storeInfo;
                    newdata['allgoodsnum'] = res.all_goods_num;
                    var selectSpec = [];
                    var specstr = '';
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
                    newdata['goodspec'] = res.goodspec;
                    newdata['selectSpec'] = selectSpec;
                    newdata['pageshow'] = true;
                    newdata['specstr'] = specstr;
                    newdata['nothing'] = false;
                    newdata['storeSet'] = res.storeSet || {};
                    newdata['postset'] = res.postset || {};
                    var postpic = res.postset.background_pic;
                    newdata['postpic'] = postpic;
                    newdata['recommendgoods'] = res.recommendgoods;
                    if (num == 1) {
                        dis_userid = res.dis_userid;
                        newdata['rate'] = res.rate;
                        newdata['commission'] = res.commission;
                        newdata['distributor'] = res.distributor;
                        newdata['style_type'] = res.styleType;
                    }
                    that.havenums = res.havenums;
                    that.qrpath = res.qrpath;
                    if (num == 1) {
                        var carpic = res.goodinfo.carousel[0];
                        var qrcodeurl = res.qrcodeurl;
                        var goodqrcode = res.goodqrcode;
                        var storelogo = res.storeinfo.logo;
                        newdata['carpic'] = carpic;
                        newdata['qrcodeurl'] = qrcodeurl;
                        newdata['goodqrcode'] = goodqrcode;
                        newdata['storelogo'] = storelogo;
                        newdata['code'] = res.code;
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
    },
    onShareAppMessage: function () {
        var openid = app.getSessionKey();
        var pic = this.data.userInfo.avatarUrl;
        var nickname = this.data.userInfo.nickName;
        if (this.data.disgrade == 1 || this.data.disgrade == 2) {
            dopenid = openid;
        } else {
            dopenid = '';
        }
        if (num == 1) {
            dopenid = dis_userid;
        }
        if (num == 0) {
            var url = '/disgoods/forward_data';
            app.sendRequest({
                url: url,
                data: {
                    openid: openid,
                    disopenid: openid,
                    pic: pic,
                    nickname: nickname
                },
                method: 'POST',
                success: function (res) {
                }
            });
        }
        return {
            title: sharetit,
            imageUrl: shareimg,
            path: '/dianshang/distDetail/distDetail?id=' + id + '&disopenid=' + dopenid + '&childid=' + childid + '&num=' + num,
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
        var bindObj;
        if (num == 0) {
            bindObj = 6;
        } else {
            bindObj = 7;
        }
        var url = '/dianshang/goodsEvaluate/goodsEvaluate?id=' + id + '&bindObj=' + bindObj;
        app.turnToPage(url);
    },
    shopHomepage: function () {
        var url = '/pages/goodsHome/goodsHome';
        wx.reLaunch({
            url: url
        });
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
        var sonid = this.data.sonid;
        var isself = this.data.isself;
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
            var url = '';
            if (num == 0) {
                url = '/webapp/addShopcars';
            } else {
                url = '/disweb/addShopcars'
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
                    isself: isself,
                    bindObj: 6
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
        var that = this;
        var spec_id = this.data.spec_id;
        var sonid = this.data.sonid;
        var isself = this.data.isself;
        var url = '';
        if (num == 0) {
            url = '/webapp/nowBuyGood';
        } else {
            url = '/disweb/nowBuyGood'
        }
        if (spec_id != 0) {
            var openid = app.getSessionKey();
            var specstr = this.data.specstr;
            var nums = this.data.buynum;
            app.sendRequest({
                url: url,
                method: 'post',
                data: {
                    openid: openid,
                    specstr: specstr,
                    num: nums,
                    spec_id: spec_id,
                    good_id: id,
                    sonid: sonid,
                    isself: isself,
                    bindObj: 6
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
                        if (num == 0) {
                            var url = '/dianshang/createOrder/createOrder?carid=' + caridArr + '&bindObj=6' + '&childidArr=' + childidArr;
                        } else {
                            var url = '/dianshang/createOrder/createOrder?carid=' + caridArr + '&bindObj=7' + '&childidArr=' + childidArr + '&num=' + num;
                        }
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
        var sonid = this.data.sonid;
        var isself = this.data.isself;
        var url = '';
        if (num == 0) {
            url = '/webapp/recommend';
        } else {
            url = '/disweb/recommend'
        }
        app.sendRequest({
            url: url,
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
        var cid = app.getset(e).cid;
        var sonid = this.data.sonid;
        var isself = this.data.isself;
        var url = '/dianshang/distDetail/distDetail?id=' + rid + '&bindObj=6&sonid=' + sonid + '&isself=' + isself + '&childid=' + cid + '&num=' + num;
        app.turnToPage(url);
    },
    forwardDis: function () {
        var qrpath = this.qrpath;
        var qrpathArr = [];
        if (qrpath == '') {
            var that = this;
            var openid = app.getSessionKey();
            var pic = this.data.userInfo.avatarUrl;
            var nickname = this.data.userInfo.nickName;
            app.toast({ title: '海报合成中...' })
            app.sendRequest({
                url: '/disgoods/forward_disgoods',
                method: 'post',
                data: {
                    openid: openid,
                    disopenid: disopenid,
                    pic: pic,
                    nickname: nickname
                },
                success: function (res) {
                    app.hideToast();
                    if (res.code == 1) {
                        qrpathArr.push(res.posturl);
                        wx.previewImage({
                            urls: qrpathArr
                        })
                    } else {
                        app.showModal({
                            content: res.msg,
                        })
                    }
                }
            })
        } else {
            qrpathArr.push(qrpath);
            wx.previewImage({
                urls: qrpathArr
            })
        }
    },
    chooseDetail: function (e) {
        var index = app.getset(e).index;
        if (index != this.data.detailstatus) {
            this.setData({
                detailstatus: index
            })
        }
    },
    shopHomepage: function () {
        var url = '/dianshang/shopHome/shopHome?childid=' + childid;
        app.turnToPage(url);
    },
    emptyEvent: function () {
    },
    openShare: function (e) {
        if (this.data.distributor == 1 && this.data.style_type == 1) {
            var url = '/pages/iWantDis/iWantDis';
            app.turnToPage(url);
        } else {
            this.setData({
                showShare: true
            })
        }
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
    openImg: function (e) {
        var img = app.getset(e).img;
        var urls = this.data.carousel;
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