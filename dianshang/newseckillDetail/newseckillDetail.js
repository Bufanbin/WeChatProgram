var app = getApp();
var WxParse = require('../../components/wxParse/wxParse.js');
var id, timestr, childid;
var shareimg = '', sharetit = app.getAppTitle();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    timer: 0,
    endtime: '',
    data: {
        hour: 0,
        minute: 0,
        second: 0,
        scroll: true,
        showDescPage: false,
        showParamPage: false,
        buynum: 1,
        needMoney: 0,
        surplus: 0,
        spec_id: 0,
        specstr: '',
        btnType: 0,
        newstarttime: '',
        newendtime: '',
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
        startstr: '',
        showShare: false,
        code: 0,
        compic: '',
        senior_icon4_pic: app.globalData.siteBaseUrl + '/static/user/images/senior_icon4.png',
    },
    onLoad: function (e) {
        id = e.id;
        childid = e.childid || 0;
        this.setData({
            childid: childid,
            id: id
        })
        app.addIplog();
        app.checkLogin();
    },
    onHide: function () {
        clearInterval(this.timer);
    },
    onUnload: function () {
        clearInterval(this.timer);
    },
    onShow: function () {
        app.setPageUserInfo();
        var that = this;
        var sWidth;
        wx.getSystemInfo({
            success: function (res) {
                sWidth = res.windowWidth - 20;
            }
        })
        app.sendRequest({
            url: '/seck/newseck_gooddetails',
            method: 'post',
            data: {
                good_id: id,
                child_id: childid
            },
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
                    var goodinfo = res.goodinfo;
                    var article = goodinfo.details.toString();
                    article = article.replace(/px\)/g, '/320*' + sWidth + 'px)');
                    WxParse.wxParse('article', 'html', article, that, 5);
                    var newdata = {};
                    newdata['thumbnail'] = goodinfo.thumbnail;
                    newdata['carousel'] = goodinfo.carousel;
                    newdata['goodname'] = goodinfo.goodname;
                    newdata['goodsDiscount'] = res.price;
                    newdata['goodsPrice'] = res.oldprice;
                    newdata['freight'] = goodinfo.freight;
                    newdata['salenum'] = goodinfo.allSales;
                    newdata['is_show'] = res.is_show;
                    newdata['goodattr'] = res.goodattr;
                    newdata['evaluate.list'] = res.goodcomment;
                    newdata['evaluate.total'] = res.commentnum;
                    newdata['goodId'] = id;
                    newdata['inventoryprice'] = res.inventoryprice;
                    newdata['inventory'] = res.inventory;
                    newdata['isEvaluate'] = res.goodinfo.isEvaluate;
                    newdata['pageshow'] = true;
                    newdata['startime'] = res.starttime;
                    newdata['newstarttime'] = res.newstarttime;
                    newdata['newendtime'] = res.newendtime;
                    newdata['evaluateType[0].num'] = res.goodnum;
                    newdata['evaluateType[1].num'] = res.middlenum;
                    newdata['evaluateType[2].num'] = res.badnum;
                    newdata['evaluateType[3].num'] = res.picnum;
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
                    newdata['specstr'] = specstr;
                    newdata['startstr'] = res.timestr;
                    wx.setNavigationBarTitle({
                        title: res.goodinfo.goodname
                    })
                    if (res.is_show == 1) {
                        that.endtime = res.endtime;
                        that.timer = setInterval(that.GetRTime, 1000);
                    } else if (res.is_show == 3) {
                        that.endtime = res.starttime;
                        that.timer = setInterval(that.GetRTime, 1000);
                    }
                    var postset = res.postinfo;
                    var carpic = res.goodinfo.carousel[0];
                    var qrcodeurl = res.qrcodeurl;
                    var goodqrcode = res.goodQrcode;
                    var storelogo = res.storeinfo.logo;
                    var postpic = postset.background_pic;
                    newdata['postset'] = postset;
                    newdata['carpic'] = carpic;
                    newdata['qrcodeurl'] = qrcodeurl;
                    newdata['goodqrcode'] = goodqrcode;
                    newdata['storelogo'] = storelogo;
                    newdata['postpic'] = postpic;
                    newdata['newstoreinfo'] = res.storeinfo;
                    newdata['code'] = res.code;
                    that.setData(newdata);
                    if (res.share_tem.code == 1) {
                        sharetit = res.share_tem.tem_info.title;
                        shareimg = res.share_tem.tem_info.picpath;
                    }
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
    dataInitial: function () {
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
            title: sharetit,
            imageUrl: shareimg,
            path: '/dianshang/newseckillDetail/newseckillDetail?id=' + id + '&childid=' + childid,
            success: function (res) {
            }
        }
    },
    GetRTime: function () {
        var NowTime = new Date();
        var etime = this.endtime;
        var EndTime = new Date(etime);
        var t = EndTime.getTime() - NowTime.getTime();
        var h = 0;
        var m = 0;
        var s = 0;
        var h, m, s;
        if (t >= 0) {
            h = Math.floor(t / 1000 / 60 / 60);
            m = Math.floor(t / 1000 / 60 % 60);
            s = Math.floor(t / 1000 % 60);
            if (h < 10) {
                h = '0' + h;
            }
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            this.setData({
                hour: h,
                minute: m,
                second: s
            });
        } else {
            clearInterval(this.timer);
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
    chooseSpec: function () {
        var is_show = this.data.is_show;
        if (is_show == 2) {
            app.showModal({
                content: '商品已售罄'
            });
            return;
        } else if (is_show == 3) {
            var btime = this.data.startime
            app.showModal({
                content: '活动将在' + btime + '准时开始'
            });
            return;
        } else if (is_show == 4) {
            app.showModal({
                content: '活动已结束'
            });
            return;
        }
        this.setData({
            showDescPage: true,
            scroll: 'hidden',
            btnType: 0
        });
    },
    showParamPage: function () {
        this.setData({
            showParamPage: true
        });
    },
    moreEvaluate: function () {
        var url = '/dianshang/goodsEvaluate/goodsEvaluate?id=' + id + '&bindObj=4';
        app.turnToPage(url);
    },
    showbuy: function () {
        var is_show = this.data.is_show;
        if (is_show == 2) {
            app.showModal({
                content: '商品已售罄'
            });
            return;
        } else if (is_show == 3) {
            var btime = this.data.startime
            app.showModal({
                content: '活动将在' + btime + '准时开始'
            });
            return;
        } else if (is_show == 4) {
            app.showModal({
                content: '活动已结束'
            });
            return;
        }
        this.setData({
            showDescPage: true,
            scroll: 'hidden',
            btnType: 1
        });
    },
    closeSpec: function () {
        this.setData({
            showDescPage: false,
            scroll: 'auto'
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
            var picpath = this.data.carousel[0];
            var goodname = this.data.goodname;
            var price = this.data.needMoney;
            var nums = this.data.buynum;
            var starttime = this.data.newstarttime;
            var endtime = this.data.newendtime;
            let url = "/seck/newaddShopcars";
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
                    starttime: starttime,
                    endtime: endtime
                },
                success: function (res) {
                    if (res.is_show == 1) {
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
                    } else if (res.is_show == 2) {
                        app.toast({ title: '商品已售罄' });
                    } else if (res.is_show == 3) {
                        var btime = that.data.startime;
                        app.toast({ title: '活动将在' + btime + '准时开始' });
                    } else if (res.is_show == 2) {
                        app.toast({ title: '活动已结束' });
                    }
                }
            })
        } else {
            app.toast({ title: '请先选择规格' });
        }
    },
    buynow: function (e) {
        var that = this;
        var spec_id = this.data.spec_id;
        if (spec_id != 0) {
            var openid = app.getSessionKey();
            var specstr = this.data.specstr;
            var nums = this.data.buynum;
            app.sendRequest({
                url: '/seck/newnowBuyGood',
                method: 'post',
                data: {
                    openid: openid,
                    specstr: specstr,
                    num: nums,
                    spec_id: spec_id,
                    good_id: id
                },
                success: function (res) {
                    if (res.is_show == 1) {
                        if (res.code == 1) {
                            var caridOne = [];
                            var carid = [];
                            caridOne.push(res.carid);
                            carid.push(caridOne);
                            var caridArr = JSON.stringify(carid);
                            var childArr = [];
                            childArr.push(childid);
                            var childidArr = JSON.stringify(childArr);
                            var url = '/dianshang/createOrder/createOrder?carid=' + caridArr + '&bindObj=5' + '&childidArr=' + childidArr;
                            app.turnToPage(url);
                        } else if (res.code == 3) {
                            app.toast({ title: '商品数量不足' });
                        } else if (res.code == 5) {
                            app.toast({ title: res.msg });
                        }
                    } else if (res.is_show == 2) {
                        app.toast({ title: '商品已售罄' });
                    } else if (res.is_show == 3) {
                        var btime = that.data.startime;
                        app.toast({ title: '活动将在' + btime + '准时开始' });
                    } else if (res.is_show == 4) {
                        app.toast({ title: '活动已结束' });
                    } else if (res.code == 5) {
                        app.toast({ title: res.msg });
                    }
                }
            })
        } else {
            app.toast({ title: '请先选择规格' });
        }
    },
    closeParamPage: function () {
        this.setData({
            showParamPage: false
        });
    },
    backhome: function () {
        app.backhome();
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
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
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