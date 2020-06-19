var app = getApp();
var goodid, orderId, groupid;
Page({
    data: {
        loaded: false,
        goodid: 0,
        storename: '',
        endtime: '',
        groupuser: [],
        h1: 0,
        h2: 0,
        m1: 0,
        m2: 0,
        s1: 0,
        s2: 0,
        leftuser: [],
        isalone: 0,
        scroll: true,
        showDescPage: false,
        buynum: 1,
        needMoney: 0,
        surplus: 0,
        specstr: '',
        groupeople: 0,
        speclist: [],
        newgroupinfo: '',
        limits_num: 0,
        showTip: false,
        tipText: ''
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        goodid = e.goodid;
        orderId = e.orderId || '';
        groupid = e.groupid;
        this.loadData();
    },
    onHide: function () {
        clearInterval(this.timer);
    },
    onUnload: function () {
        clearInterval(this.timer);
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    dataInitial: function () {
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
            path: '/pintuan/groupInvitation/groupInvitation?groupid=' + groupid + '&goodid=' + goodid,
            success: function (res) {
            }
        }
    },
    loadData: function () {
        var that = this;
        var order_id = 0;
        if (orderId) {
            order_id = orderId;
        }
        app.sendRequest({
            url: '/webapp/newpinOrderDetail',
            data: {
                good_id: goodid,
                order_id: order_id,
                groupid: groupid,
                openid: app.getSessionKey()
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    var storename = res.storename;
                    newdata['groupinfo'] = res.groupinfo;
                    newdata['groupuser'] = res.groupuser;
                    newdata['isalone'] = res.isalone;
                    newdata['orderdetail'] = res.orderdetail;
                    newdata['issuccess'] = res.issuccess;
                    newdata['is_del'] = res.is_del;
                    newdata['storename'] = res.storename;
                    if (res.groupinfo.status == 1 || res.groupinfo.status == 5) {
                        newdata['orderstatus'] = '拼团中';
                    } else if (res.groupinfo.status == 2) {
                        newdata['orderstatus'] = '拼团成功！';
                    } else if (res.groupinfo.status == 3 || res.groupinfo.status == 4 || res.groupinfo.status == 6) {
                        newdata['orderstatus'] = '拼团失败，已过期';
                    }
                    newdata['endtime'] = res.newendtime || 0;
                    var leftnum = res.groupinfo.decnum;
                    var leftuser = [];
                    for (var i = 0; i < leftnum; i++) {
                        leftuser.push('?');
                    }
                    newdata['leftuser'] = leftuser;
                    newdata['isalone'] = res.isalone;
                    newdata['loaded'] = true;
                    that.setData(newdata);
                    app.setPageTitle(storename);
                    that.timer = setInterval(that.GetRTime, 1000);
                }
            }
        });
    },
    GetRTime: function () {
        var NowTime = new Date();
        var etime = this.data.endtime;
        var EndTime = new Date(etime);
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
            this.setData({
                h1: h1,
                h2: h2,
                m1: m1,
                m2: m2,
                s1: s1,
                s2: s2
            })
        } else {
            clearInterval(this.timer);
        }
    },
    goToGroup: function (e) {
        var childid = this.data.groupinfo.child_id;
        var url = '/pintuan/groupGoodsdetail/groupGoodsdetail?id=' + goodid + '&groupid=' + groupid + '&childid=' + childid;
        app.turnToPage(url, 1);
    },
    reGroup: function () {
        var childid = this.data.groupinfo.child_id;
        var url = '/pintuan/groupGoodsdetail/groupGoodsdetail?id=' + goodid + '&childid=' + childid;
        app.turnToPage(url, 1);
    },
    goToOrderDetail: function (e) {
        var childid = this.data.groupinfo.child_id;
        var url = '/pintuan/groupGoodsorderdetails/groupGoodsorderdetails?orderId=' + orderId + '&groupid=' + groupid + '&goodid=' + goodid + '&childid=' + childid;
        app.turnToPage(url);
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    showbuy: function (e) {
        var that = this;
        var openid = app.getSessionKey();
        var childid = this.data.groupinfo.child_id;
        app.sendRequest({
            url: '/webapp/groupgoodsInfo',
            data: {
                good_id: goodid,
                child_id: childid,
                openid: openid,
                groupid: groupid
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    var selectSpec = [];
                    var specstr = '';
                    var speclist = [];
                    if (groupid == 0) {
                        var groupnum = res.groupinfo[0].group_nums;
                    } else {
                        var groupnum = res.newgroupinfo.groupnum;
                    }
                    for (var i = 0; i < res.goodspec.length; i++) {
                        var specOne = { name: res.goodspec[i].nameone, content: res.goodspec[i].two[0].nametwo };
                        selectSpec.push(specOne);
                        res.goodspec[i].two[0].select = true;
                        specstr += res.goodspec[i].nameone + ':' + res.goodspec[i].two[0].nametwo + ' ';
                        speclist.push(res.goodspec[i].two[0].nametwo);
                    }
                    for (var i = 0; i < res.inventoryprice.length; i++) {
                        if (res.inventoryprice[i].spec_desc == '参团人数:' + groupnum + ' ' + specstr) {
                            newdata['needMoney'] = res.inventoryprice[i].price;
                            newdata['surplus'] = res.inventoryprice[i].inventory;
                            newdata['oneprice'] = res.inventoryprice[i].oneprice;
                        }
                    }
                    var newgroupinfo = res.newgroupinfo;
                    newdata['picpath'] = res.goodinfo.picpath;
                    newdata['goodspec'] = res.goodspec;
                    newdata['selectSpec'] = selectSpec;
                    newdata['specstr'] = specstr;
                    newdata['groupeople'] = newgroupinfo.groupnum;
                    newdata['groupmoney'] = newgroupinfo.price;
                    newdata['speclist'] = speclist;
                    newdata['inventoryprice'] = res.inventoryprice;
                    newdata['limits_num'] = res.goodinfo.limits_num;
                    newdata['showDescPage'] = true;
                    that.setData(newdata);
                }
                if (res.code == 1000 || res.code == 2000) {
                    that.setData({
                        vqdlevel: 1000,
                        pageshow: res.code
                    })
                    wx.setNavigationBarTitle({
                        title: '待升级提示'
                    });
                }
            }
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
    closeSpec: function () {
        this.setData({
            showDescPage: false,
            scroll: 'auto'
        });
    },
    buynow: function (e) {
        var that = this;
        var openid = app.getSessionKey();
        var info = app.globalData.userInfo
        var nums = this.data.buynum;
        let price = this.data.needMoney;
        let totalprice = parseFloat(price) * nums
        let specstr = '参团人数:' + this.data.groupeople + ' ' + this.data.specstr;
        app.sendRequest({
            url: '/webapp/selgroupGoods',
            method: 'post',
            data: {
                openid: openid,
                specstr: specstr,
                num: nums,
                good_id: goodid,
                totalprice: totalprice,
                price: price,
                groupid: groupid,
                groupnum: this.data.groupeople,
                isalone: 0,
                nickname: info.nickName,
                avatar: info.avatarUrl
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
    closenewgift: function () {
        app.closenewgift();
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    }
})