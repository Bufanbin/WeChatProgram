var WxParse = require('../../components/wxParse/wxParse.js');
var app = getApp();
var id, childid;
var specstr = '';
var initialdate = '';
var sWidth;
var shareimg = '', sharetit = app.getAppTitle();
Page({
    data: {
        scroll: true,
        showDescPage: false,
        showParamPage: false,
        buynum: 1,
        needMoney: 0,
        surplus: 0,
        specstr: '',
        btnType: 0,
        commoditynum: 1,
        chooseGroup: 0,
        groupeople: 0,
        isonegroup: 1,
        groupid: '',
        d: '0',
        h: '00',
        m: '00',
        s: '00',
        update: '',
        allgrouptime: '',
        evaluateType: [
            { name: '好评' },
            { name: '中评' },
            { name: '差评' },
            { name: '有图' }
        ],
        detailType: [
            { name: '商品详情' },
            { name: '拼团须知' }
        ],
        detailstatus: 0,
        storeinfo: {},
        speclist: [],
        showTip: false,
        tipText: '',
        showBg: false,
        showGroup: false,
        showShare: false,
        showFriends: false,
        compic: '',
        loadSharePic: false,
        showCommssion: false,
        com_money: 0,
        groupid: 0,
        newgroupinfo: '',
        showShareType: false,
        shareType: 0,
        limits_num: 0,
        code: 0,
        group_icon_pic1: app.globalData.siteBaseUrl + '/static/user/images/group_icon1.png',
        group_icon_pic2: app.globalData.siteBaseUrl + '/static/user/images/group_icon2.png',
        group_icon_pic3: app.globalData.siteBaseUrl + '/static/user/images/group_icon3.png',
        group_icon_pic4: app.globalData.siteBaseUrl + '/static/user/images/group_icon4.png',
        senior_icon4_pic: app.globalData.siteBaseUrl + '/static/user/images/senior_icon4.png',
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        id = e.id;
        childid = e.childid || 0;
        var groupid = e.groupid || 0;
        this.setData({
            id: e.id,
            childid: childid,
            groupid: groupid
        })
        wx.getSystemInfo({
            success: function (res) {
                sWidth = res.windowWidth - 20;
            }
        })
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
        this.setTime();
    },
    onHide: function () {
        clearInterval(this.update);
        this.closeGoup();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var groupid;
        if (this.data.groupid != -1) {
            groupid = this.data.groupid;
        }
        app.sendRequest({
            url: '/webapp/groupgoodsInfo',
            data: {
                good_id: id,
                child_id: childid,
                openid: openid,
                groupid: groupid
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
                    var article = res.goodinfo.details.toString();
                    article = article.replace(/px\)/g, '/320*' + sWidth + 'px)');
                    WxParse.wxParse('article', 'html', article, that, 5);
                    var newdata = {};
                    newdata['carousel'] = res.goodinfo.carousel;
                    newdata['goodsName'] = res.goodinfo.goodname;
                    if (res.goodinfo.freighttype == 1) {
                        newdata['freight'] = '免运费';
                    } else {
                        newdata['freight'] = res.goodinfo.freight;
                    }
                    newdata['evaluate.list'] = res.goodcomment;
                    newdata['evaluate.total'] = res.commentnum;
                    newdata['goodsPrice'] = res.oldprice;
                    newdata['goodsDiscount'] = res.price;
                    newdata['goodId'] = id;
                    newdata['inventoryprice'] = res.inventoryprice;
                    newdata['inventory'] = res.inventory;
                    newdata['picpath'] = res.goodinfo.picpath;
                    newdata['isEvaluate'] = res.goodinfo.isEvaluate;
                    newdata['abstract'] = res.goodinfo.abstract;
                    newdata['isend'] = res.isend;
                    newdata['newdedprice'] = res.groupinfo[0].newdedprice.toFixed(2);
                    newdata['groupeople'] = res.groupinfo[0].group_nums;
                    newdata['groupmoney'] = res.groupinfo[0].price;
                    newdata['group_nums'] = res.group_nums;
                    newdata['groupinfo'] = res.groupinfo;
                    newdata['startnum'] = res.startnum;
                    newdata['group'] = res.group;
                    newdata['allGroup'] = res.allGroupArr;
                    newdata['allgoodsnum'] = res.all_goods_num;
                    newdata['storeinfo'] = res.storeinfo;
                    newdata['allgoodsnum'] = res.all_goods_num;
                    newdata['storeInfo'] = res.storeInfo;
                    var selectSpec = [];
                    var specstr = '';
                    var speclist = [];
                    for (var i = 0; i < res.goodspec.length; i++) {
                        var specOne = { name: res.goodspec[i].nameone, content: res.goodspec[i].two[0].nametwo };
                        selectSpec.push(specOne);
                        res.goodspec[i].two[0].select = true;
                        specstr += res.goodspec[i].nameone + ':' + res.goodspec[i].two[0].nametwo + ' ';
                        speclist.push(res.goodspec[i].two[0].nametwo);
                    }
                    if (that.data.groupid == 0) {
                        var groupnum = res.groupinfo[0].group_nums;
                    } else {
                        var groupnum = res.newgroupinfo.groupnum;
                    }
                    for (var i = 0; i < res.inventoryprice.length; i++) {
                        if (res.inventoryprice[i].spec_desc == '参团人数:' + groupnum + ' ' + specstr) {
                            newdata['needMoney'] = res.inventoryprice[i].price;
                            newdata['surplus'] = res.inventoryprice[i].inventory;
                            newdata['oneprice'] = res.inventoryprice[i].oneprice;
                        }
                    }
                    newdata['goodspec'] = res.goodspec;
                    newdata['selectSpec'] = selectSpec;
                    newdata['pageshow'] = true;
                    newdata['specstr'] = specstr;
                    newdata['nothing'] = false;
                    newdata['evaluateType[0].num'] = res.goodnum;
                    newdata['evaluateType[1].num'] = res.middlenum;
                    newdata['evaluateType[2].num'] = res.badnum;
                    newdata['evaluateType[3].num'] = res.picnum;
                    newdata['speclist'] = speclist;
                    newdata['com_money'] = res.goodinfo.com_money;
                    newdata['groupid'] = res.groupid;
                    newdata['limits_num'] = res.goodinfo.limits_num;
                    newdata['about_group'] = res.goodinfo.about_group;
                    newdata['endtime'] = res.goodinfo.endtime;
                    newdata['starttime'] = res.goodinfo.starttime;
                    var newgroupinfo = res.newgroupinfo;
                    if (newgroupinfo) {
                        newdata['newgroupinfo'] = newgroupinfo;
                        newdata['groupeople'] = newgroupinfo.groupnum;
                        newdata['groupmoney'] = newgroupinfo.price;
                    }
                    var postset = res.postset;
                    var carpic = res.goodinfo.carousel[0].picpath;
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
                    newdata['code'] = res.code;
                    if (res.share_tem.code == 1) {
                        sharetit = res.share_tem.tem_info.title;
                        shareimg = res.share_tem.tem_info.picpath;
                    }
                    that.setData(newdata);
                    wx.setNavigationBarTitle({
                        title: res.goodinfo.goodname
                    })
                }
                if (res.code == 1000 || res.code == 2000) {
                    that.setData({
                        vqdlevel: res.code,
                        pageshow: true
                    })
                    wx.setNavigationBarTitle({
                        title: '待升级提示'
                    });
                }
            }
        });
    },
    dataInitial: function () {
        initialdate = true;
    },
    onShareAppMessage: function () {
        var groupid = this.data.groupid;
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
            path: '/pintuan/groupGoodsdetail/groupGoodsdetail?id=' + id + '&childid=' + childid + '&groupid=' + groupid,
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
        var url = '/dianshang/goodsEvaluate/goodsEvaluate?id=' + id + '&bindObj=3';
        app.turnToPage(url);
    },
    closeSpec: function () {
        this.setData({
            showDescPage: false,
            scroll: 'auto'
        });
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
        var limits_num = this.data.limits_num;
        if (limits_num > 0 && buynum > limits_num) {
            app.openTip('该商品每人限购' + limits_num + '件');
            return false;
        }
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
        var specstr = '';
        var speclist = [];
        var oneprice = 0;
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
            speclist.push(selectSpec[i].content);
        }
        for (var i = 0; i < inventoryprice.length; i++) {
            var spec_desc = inventoryprice[i].spec_desc;
            if (spec_desc == '参团人数:' + this.data.groupeople + ' ' + specstr) {
                needMoney = inventoryprice[i].price;
                surplus = inventoryprice[i].inventory;
                oneprice = inventoryprice[i].oneprice;
            }
        }
        this.setData({
            goodspec: goodspec,
            selectSpec: selectSpec,
            needMoney: needMoney,
            surplus: surplus,
            specstr: specstr,
            oneprice: oneprice,
            speclist: speclist
        })
    },
    showend: function () {
        if (this.data.isend == 2) {
            app.openTip('亲-活动时间已结束，无法再购买商品了');
        } else if (this.data.isend == 3) {
            app.openTip('亲-活动时间还未开始哦');
        }
    },
    showbuy: function (e) {
        this.setData({
            showDescPage: true,
            scroll: 'hidden',
            btnType: 1,
            isonegroup: app.getset(e).isonegroup
        });
    },
    buynow: function (e) {
        var that = this;
        var openid = app.getSessionKey();
        var info = app.globalData.userInfo
        var nums = this.data.buynum;
        let price = this.data.isonegroup == 1 ? this.data.oneprice : this.data.needMoney;
        let totalprice = parseFloat(price) * nums
        let specstr = '参团人数:' + this.data.groupeople + ' ' + this.data.specstr;
        app.sendRequest({
            url: '/webapp/selgroupGoods',
            method: 'post',
            data: {
                openid: openid,
                specstr: specstr,
                num: nums,
                good_id: id,
                totalprice: totalprice,
                price: price,
                groupid: this.data.groupid,
                groupnum: this.data.groupeople,
                isalone: this.data.isonegroup,
                nickname: info.nickName,
                avatar: info.avatarUrl,
                groupid: this.data.groupid
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/pintuan/createGrouporder/createGrouporder?order_id=' + res.order_id;
                    app.turnToPage(url);
                } else {
                    app.openTip(res.msg);
                }
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
    changeGroup: function (e) {
        var data = app.getset(e);
        var inventoryprice = this.data.inventoryprice;
        this.setData({
            chooseGroup: data.index,
            newdedprice: data.newdedprice.toFixed(2),
            groupeople: data.groupeople,
            groupmoney: data.groupmoney,
            compic: ''
        })
        for (let i = 0; i < inventoryprice.length; i++) {
            if (inventoryprice[i].spec_desc.includes('参团人数:' + data.groupeople + ' ' + this.data.specstr)) {
                this.setData({
                    surplus: inventoryprice[i].inventory,
                    needMoney: inventoryprice[i].price,
                    oneprice: inventoryprice[i].oneprice
                })
            }
        }
    },
    moreGroup: function (e) {
        var that = this;
        this.allgrouptime = setInterval(function () {
            that.setAllGroupEndTime()
        }, 1000)
        this.setData({
            showBg: true,
            showGroup: true
        })
    },
    goToGroup: function (e) {
        this.closeGoup();
        var groupid = app.getset(e).groupid;
        var url = '/pintuan/groupInvitation/groupInvitation?groupid=' + groupid + '&goodid=' + id;
        app.turnToPage(url);
    },
    setTime: function (e) {
        var that = this;
        this.update = setInterval(function () {
            that.setEndTime();
            that.setGroupEndTime();
            that.setStartTime();
        }, 1000);
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
    closeGoup: function (e) {
        clearInterval(this.allgrouptime);
        this.setData({
            showBg: false,
            showGroup: false
        })
    },
    goToRebate: function (e) {
        var url = '/pintuan/rebate_detail/rebate_detail';
        app.turnToPage(url);
    },
    emptyEvent: function () {
    },
    openShare: function (e) {
        this.setData({
            showShare: true
        })
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    setEndTime: function () {
        var that = this;
        if (this.data.isend != 1) {
            return;
        }
        var time1 = that.data.endtime;
        if (time1) {
            time1 = new Date(time1).getTime();
            var time2 = new Date().getTime();
            var dtime = (time1 - time2) / 1000;
            if (dtime <= 0) {
                clearInterval(that.update);
                return 0;
            }
            that.d = Math.floor(dtime / 3600 / 24);
            that.h = Math.floor(dtime / 3600 % 24);
            that.m = Math.floor(dtime % 3600 / 60);
            that.s = Math.floor(dtime % 3600 % 60);
            if (that.h < 10)
                that.h = '0' + that.h;
            if (that.m < 10)
                that.m = '0' + that.m;
            if (that.s < 10)
                that.s = '0' + that.s;
            that.setData({
                d: that.d,
                h: that.h,
                s: that.s,
                m: that.m
            });
        }
    },
    setGroupEndTime: function () {
        if (this.data.isend != 1) {
            return;
        }
        var group = this.data.group;
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                let time1 = group[i].time;
                time1 = new Date(time1).getTime();
                let time2 = new Date().getTime();
                let dtime = (time1 - time2) / 1000;
                if (dtime <= 0) {
                    continue;
                }
                let h = Math.floor(dtime / 3600);
                let m = Math.floor(dtime % 3600 / 60);
                let s = Math.floor(dtime % 3600 % 60);
                if (h < 10)
                    h = '0' + h;
                if (m < 10)
                    m = '0' + m;
                if (s < 10)
                    s = '0' + s;
                group[i].h = h;
                group[i].m = m;
                group[i].s = s;
            }
            this.setData({
                group: group
            });
        }
    },
    setStartTime: function () {
        var that = this;
        if (this.data.isend != 3) {
            return;
        }
        var time1 = that.data.starttime;
        if (time1) {
            time1 = new Date(time1).getTime();
            var time2 = new Date().getTime();
            var dtime = (time1 - time2) / 1000;
            if (dtime <= 0) {
                clearInterval(that.update);
                return 0;
            }
            that.d = Math.floor(dtime / 3600 / 24);
            that.h = Math.floor(dtime / 3600 % 24);
            that.m = Math.floor(dtime % 3600 / 60);
            that.s = Math.floor(dtime % 3600 % 60);
            if (that.h < 10)
                that.h = '0' + that.h;
            if (that.m < 10)
                that.m = '0' + that.m;
            if (that.s < 10)
                that.s = '0' + that.s;
            that.setData({
                d: that.d,
                h: that.h,
                s: that.s,
                m: that.m
            });
        }
    },
    setAllGroupEndTime: function () {
        var group = this.data.allGroup;
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                let time1 = group[i].time;
                time1 = new Date(time1).getTime();
                let time2 = new Date().getTime();
                let dtime = (time1 - time2) / 1000;
                if (dtime <= 0) {
                    continue;
                }
                let h = Math.floor(dtime / 3600);
                let m = Math.floor(dtime % 3600 / 60);
                let s = Math.floor(dtime % 3600 % 60);
                if (h < 10)
                    h = '0' + h;
                if (m < 10)
                    m = '0' + m;
                if (s < 10)
                    s = '0' + s;
                group[i].h = h;
                group[i].m = m;
                group[i].s = s;
            }
            this.setData({
                allGroup: group
            });
        }
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