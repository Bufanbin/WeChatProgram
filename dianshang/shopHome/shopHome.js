var app = getApp();
var child_id = 0;
var img = { path: '', width: 0, height: 0 };
var img1 = { path: '', width: 0, height: 0 };
var img2 = { path: '', width: 0, height: 0 };
Page({
    timer: 0,
    data: {
        loaded: false,
        status: 0,
        showbg: false,
        showdetail: false,
        showclassify: false,
        couponlist: [],
        goodslist: [],
        distributelist: [],
        grouplist: [],
        seckilllist: [],
        classifylist: [],
        fullInfo: [],
        h1Arr: [],
        h2Arr: [],
        m1Arr: [],
        m2Arr: [],
        s1Arr: [],
        s2Arr: [],
        shopmsg: '',
        havenums: 0,
        dishavenums: 0,
        grouphavenums: 0,
        seckhavenums: 0,
        distributor: 0,
        loadSharePic: false,
        compic: '',
        storepic: '',
        close_shopdetail_pic: app.globalData.siteBaseUrl + '/static/user/images/close_shopdetail.png',
        wechat_icon_pic: app.globalData.siteBaseUrl + '/static/user/images/wechat_icon.png',
        loading_pic: app.globalData.siteBaseUrl + '/static/user/images/loading.gif',
        friends_circle_pic: app.globalData.siteBaseUrl + '/static/user/images/friends_circle.png',
        home_coupon_img: app.globalData.siteBaseUrl + '/static/user/images/home_coupon_img.png',
        kjhavenums: 0,
        kjGoodLists: [],
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        child_id = e.childid;
        var disopenid = e.disopenid;
        if (disopenid && disopenid != '0') {
            app.globalData.disopenid = disopenid;
        }
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    onShareAppMessage: function () {
        var pageRouter = this.page_router;
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
            path: '/dianshang/shopHome/shopHome?childid=' + child_id,
            success: function (res) {
            }
        }
    },
    onHide: function () {
        if (this.data.seckilllist.length > 0) {
            clearInterval(this.timer);
        }
    },
    onUnload: function () {
        if (this.data.seckilllist.length > 0) {
            clearInterval(this.timer);
        }
    },
    dataInitial: function () {
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/newapp/ds_storeIndex',
            method: 'post',
            data: {
                child_id: child_id,
                openid: app.getSessionKey()
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    var havenums = 0;
                    var dishavenums = 0;
                    var grouphavenums = 0;
                    var seckhavenums = 0;
                    var goodslist = [];
                    var distributelist = [];
                    var grouplist = [];
                    var seckilllist = [];
                    var kjhavenums = 0;
                    var kjGoodLists = [];
                    if (res.kjGoodList.goods) {
                        kjGoodLists = res.kjGoodList.goods;
                        kjhavenums = res.kjGoodList.goods.length || 0;
                    }
                    if (res.goodlist.goods) {
                        goodslist = res.goodlist.goods;
                        havenums = res.goodlist.goods.length || 0;
                    }
                    if (res.disgoodList.goods) {
                        distributelist = res.disgoodList.goods;
                        dishavenums = res.disgoodList.goods.length || 0;
                    }
                    if (res.groupGoodList.goods) {
                        grouplist = res.groupGoodList.goods;
                        grouphavenums = res.groupGoodList.goods.length || 0;
                    }
                    if (res.seckGoodList.goods) {
                        seckilllist = res.seckGoodList.goods;
                        seckhavenums = res.seckGoodList.goods.length || 0;
                    }
                    var storeinfo = res.storeinfo;
                    var storepic = storeinfo.picpath || app.globalData.siteBaseUrl + '/static/newuser/images/phone_homeimg.jpg';
                    var postSet = res.postSet;
                    var qrcode = res.qrcode;
                    newdata['status'] = res.code;
                    newdata['storeinfo'] = storeinfo;
                    newdata['storepic'] = storepic;
                    newdata['goodslist'] = goodslist;
                    newdata['distributelist'] = distributelist;
                    newdata['grouplist'] = grouplist;
                    newdata['seckilllist'] = seckilllist;
                    newdata['classifylist'] = res.goodsType;
                    newdata['fullInfo'] = res.fullInfo;
                    newdata['couponlist'] = res.couponlist;
                    newdata['loaded'] = true;
                    newdata['havenums'] = havenums;
                    newdata['dishavenums'] = dishavenums;
                    newdata['grouphavenums'] = grouphavenums;
                    newdata['seckhavenums'] = seckhavenums;
                    newdata['distributor'] = res.distributor;
                    newdata['postSet'] = postSet;
                    newdata['kjGoodLists'] = kjGoodLists;
                    newdata['kjhavenums'] = kjhavenums;
                    if (seckilllist.length > 0) {
                        that.timer = setInterval(that.GetRTime, 1000)
                    }
                    that.setData(newdata);
                    var background_pic = postSet.background_pic;
                    var storelogo = storeinfo.logo;
                    var date = new Date();
                    var time = date.getTime();
                    wx.downloadFile({
                        url: background_pic,
                        success: function (res) {
                            img.path = res.tempFilePath;
                            wx.getImageInfo({
                                src: res.tempFilePath,
                                success: function (rres) {
                                    img.width = rres.width;
                                    img.height = rres.height;
                                }
                            })
                        }
                    })
                    wx.downloadFile({
                        url: qrcode + '?t=' + time,
                        success: function (res) {
                            img1.path = res.tempFilePath
                            wx.getImageInfo({
                                src: res.tempFilePath,
                                success: function (rres) {
                                    img1.width = rres.width;
                                    img1.height = rres.height;
                                }
                            })
                        }
                    })
                    wx.downloadFile({
                        url: storelogo,
                        success: function (res) {
                            img2.path = res.tempFilePath
                            wx.getImageInfo({
                                src: res.tempFilePath,
                                success: function (rres) {
                                    img2.width = rres.width;
                                    img2.height = rres.height;
                                }
                            })
                        }
                    })
                } else {
                    newdata['status'] = res.code;
                    newdata['shopmsg'] = res.msg;
                    newdata['loaded'] = true;
                    that.setData(newdata);
                }
            }
        })
    },
    GetRTime: function () {
        var seckilllist = this.data.seckilllist;
        var h1Arr = this.data.h1Arr;
        var h2Arr = this.data.h2Arr;
        var m1Arr = this.data.m1Arr;
        var m2Arr = this.data.m2Arr;
        var s1Arr = this.data.s1Arr;
        var s2Arr = this.data.s2Arr;
        for (var i = 0; i < seckilllist.length; i++) {
            var h1 = 0, h2 = 0, m1 = 0, m2 = 0, s1 = 0, s2 = 0;
            h1Arr.push(h1);
            h2Arr.push(h2);
            m1Arr.push(m1);
            m2Arr.push(m2);
            s1Arr.push(s1);
            s2Arr.push(s2);
            var endtime = seckilllist[i].endtime;
            var NowTime = new Date();
            var EndTime = new Date(endtime);
            var t = EndTime.getTime() - NowTime.getTime();
            var h = 0;
            var m = 0;
            var s = 0;
            var h1, h2, m1, m2, s1, s2;
            if (t >= 0) {
                h = Math.floor(t / 1000 / 60 / 60);
                m = Math.floor(t / 1000 / 60 % 60);
                s = Math.floor(t / 1000 % 60);
                if (h < 10) {
                    h1 = 0;
                    h2 = h;
                } else {
                    h1 = Math.floor(h / 10);
                    h2 = h % 10;
                }
                if (m < 10) {
                    m1 = 0;
                    m2 = m;
                } else {
                    m1 = Math.floor(m / 10);
                    m2 = m % 10;
                }
                if (s < 10) {
                    s1 = 0;
                    s2 = s;
                } else {
                    s1 = Math.floor(s / 10);
                    s2 = s % 10;
                }
                h1Arr.splice(i, 1, h1);
                h2Arr.splice(i, 1, h2);
                m1Arr.splice(i, 1, m1);
                m2Arr.splice(i, 1, m2);
                s1Arr.splice(i, 1, s1);
                s2Arr.splice(i, 1, s2);
                this.setData({
                    h1Arr: h1Arr,
                    h2Arr: h2Arr,
                    m1Arr: m1Arr,
                    m2Arr: m2Arr,
                    s1Arr: s1Arr,
                    s2Arr: s2Arr
                })
            }
        }
    },
    emptyOpt: function () {
    },
    openShopDetail: function (e) {
        this.closeDialog();
        this.setData({
            showbg: true,
            showdetail: true
        })
    },
    closeDialog: function (e) {
        this.setData({
            showbg: false,
            showdetail: false,
            showclassify: false
        })
    },
    openClassify: function (e) {
        var showclassify = this.data.showclassify;
        this.setData({
            showclassify: !showclassify
        })
    },
    callPhone: function (e) {
        this.closeDialog();
        var phone = app.getset(e).phone;
        wx.makePhoneCall({
            phoneNumber: phone
        })
    },
    goToSearch: function (e) {
        this.closeDialog();
        var dataset = app.getset(e);
        var searchtype = dataset.searchtype;
        var goodstype = dataset.goodstype;
        var nid = dataset.nid || '';
        var shopname = this.data.storeinfo.storename;
        var url = '/dianshang/homeSearch/homeSearch?childid=' + child_id + '&searchtype=' + searchtype + '&goodstype=' + goodstype + '&shopname=' + shopname + '&nid=' + nid + '&mcolor=' + this.data.storeinfo.main_color;
        app.turnToPage(url);
    },
    useCoupon: function (e) {
        this.closeDialog();
        var that = this;
        var couponid = app.getset(e).cid;
        app.sendRequest({
            url: '/newapp/getVoucher',
            method: 'post',
            data: {
                child_id: child_id,
                couponid: couponid,
                openid: app.getSessionKey()
            },
            success: function (res) {
                app.showModal({
                    content: res.msg
                });
            }
        })
    },
    goToDetail: function (e) {
        this.closeDialog();
        var dataset = app.getset(e);
        var id = dataset.id;
        var bindObj = dataset.bindobj;
        var url = '';
        if (bindObj == 0) {
            url = '/dianshang/goodsDetail/goodsDetail?id=' + id + '&bindObj=' + bindObj + '&childid=' + child_id;
        } else if (bindObj == 3) {
            url = '/pintuan/groupGoodsdetail/groupGoodsdetail?id=' + id + '&childid=' + child_id;
        } else if (bindObj == 4) {
            url = '/dianshang/newseckillDetail/newseckillDetail?id=' + id + '&childid=' + child_id;
        } else if (bindObj == 7) {
            url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + app.globalData.disgrade + '&childid=' + child_id + '&num=1';
        } else if (bindObj == 8) {
            url = '/kanjia/bargainDetail/bargainDetail?id=' + id + '&childid=' + child_id;
        }
        app.turnToPage(url);
    },
    goToClassify: function (e) {
        this.closeDialog();
        var shopname = this.data.storeinfo.storename;
        var url = '/dianshang/good_classification/good_classification?childid=' + child_id + '&shopname=' + shopname;
        app.turnToPage(url);
    },
    shopMap: function (e) {
        var dataset = app.getset(e);
        var lat = dataset.lat;
        var lng = dataset.lng;
        var address = dataset.address;
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        wx.openLocation({
            latitude: lat,
            longitude: lng,
            address: address
        })
    },
    emptyEvent: function () {
    },
    openShare: function (e) {
        if (this.data.distributor == 1) {
            var url = '/pages/iWantDis/iWantDis';
            app.turnToPage(url);
        } else {
            this.setData({
                showShare: true
            })
        }
    },
    closeShare: function (e) {
        if (this.data.loadSharePic) {
            return;
        }
        this.setData({
            showShare: false,
            showFriends: false,
            showBg: false
        })
    },
    openFriends: function (e) {
        var that = this;
        var loadSharePic = this.data.loadSharePic;
        if (loadSharePic) {
            return;
        }
        this.setData({
            loadSharePic: true,
        });
        this.synthesisOpt();
    },
    shareFriends: function () {
        var that = this;
        var tempFilePath = this.data.compic;
        if (!tempFilePath) {
            return;
        }
        wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success(res) {
                app.toast({ title: '保存成功' });
                that.closeShare();
            },
            fail: function (res) {
                app.showModal({
                    title: ' ',
                    content: '是否允许保存图片到您的相册？',
                    showCancel: true,
                    confirm: function () {
                        wx.openSetting({
                            success: (rres) => {
                                if (rres.authSetting['scope.writePhotosAlbum']) {
                                    that.savePic();
                                }
                            }
                        })
                    }
                })
            }
        })
    },
    savePic: function () {
        var that = this;
        var tempFilePath = this.data.tempFilePath;
        if (!tempFilePath) {
            return;
        }
        wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success(res) {
                app.toast({ title: '保存成功' });
                that.closeFriends();
            },
            fail: function (res) {
                app.showModal({
                    title: ' ',
                    content: '是否允许保存图片到您的相册？',
                    showCancel: true,
                    confirm: function () {
                        wx.openSetting({
                            success: (rres) => {
                                if (rres.authSetting['scope.writePhotosAlbum']) {
                                    that.savePic();
                                }
                            }
                        })
                    }
                })
            }
        })
    },
    closeFriends: function (e) {
        this.setData({
            showFriends: false
        })
    },
    synthesisOpt: function () {
        if (this.data.compic) {
            this.setData({
                showShare: false,
                showBg: true,
                showFriends: true,
                loadSharePic: false
            })
        } else {
            var storeinfo = this.data.storeinfo;
            var storename = storeinfo.storename;
            var postSet = this.data.postSet;
            var logo_height = postSet.logo_height;
            var logo_left = postSet.logo_left;
            var logo_top = postSet.logo_top;
            var logo_width = postSet.logo_width;
            var qrcode_height = postSet.qrcode_height;
            var qrcode_left = postSet.qrcode_left;
            var qrcode_top = postSet.qrcode_top;
            var qrcode_width = postSet.qrcode_width;
            var storename_color = postSet.storename_color;
            var storename_left = postSet.storename_left;
            var storename_top = postSet.storename_top;
            var ctx = wx.createCanvasContext('myCanvas');
            ctx.drawImage(img.path, 0, 0, img.width, img.height, 0, 0, 640, 1008);
            ctx.save();
            ctx.drawImage(img1.path, 0, 0, img1.width, img1.height, qrcode_left, qrcode_top, qrcode_width, qrcode_height);
            ctx.save();
            ctx.drawImage(img2.path, 0, 0, img2.width, img2.height, logo_left, logo_top, logo_width, logo_height);
            ctx.save();
            ctx.setFontSize(30);
            ctx.setFillStyle(storename_color);
            ctx.setTextAlign('left');
            ctx.fillText(storename, storename_left, storename_top + 30);
            ctx.save();
            ctx.draw();
            var that = this;
            setTimeout(function () {
                wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: 640,
                    height: 1008,
                    destWidth: 640,
                    destHeight: 1008,
                    canvasId: 'myCanvas',
                    fileType: 'jpg',
                    quality: 0.8,
                    success: function (res) {
                        that.setData({
                            showShare: false,
                            showBg: true,
                            showFriends: true,
                            loadSharePic: false,
                            compic: res.tempFilePath
                        })
                    },
                    fail: function (res) {
                    }
                })
            }, 500);
        }
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    openBuyNow: function () {
        var url = '/pages/online_buy/online_buy?type=1&child_id=' + child_id;
        app.turnToPage(url);
    },
    closenewgift: function () {
        app.closenewgift();
    }
})