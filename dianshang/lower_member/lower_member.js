var app = getApp();
var dislevel;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    totaltype: 0,
    data: {
        selidx: 0,
        sel_memidx: 0,
        member_list: [],
        showtwo_member: false,
        last_member_list: [],
        topArr: [{
            name: '直属下级',
            num: ''
        }, {
            name: '间接下级',
            num: ''
        }],
    },
    onLoad: function (e) {
        app.addIplog();
        dislevel = app.globalData.dislevel;
        this.setData({
            dislevel: dislevel
        })
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    seltype: function (e) {
        var type = app.getset(e).type;
        this.setData({
            selidx: type
        });
        this.resetData();
        this.loadData();
    },
    moremember: function (e) {
        var that = this;
        var dataset = app.getset(e);
        var mid = dataset.id;
        var idx = dataset.idx;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/disweb/twoLevelList',
            method: 'post',
            data: {
                openid: openid,
                fatherid: mid
            },
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        last_member_list: res.twolist,
                        showtwo_member: true,
                        sel_memidx: idx
                    })
                }
            }
        });
    },
    closetip: function () {
        this.setData({
            showtwo_member: false
        })
    },
    resetData: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
        this.setData({
            nothing: false,
            member_list: []
        })
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var type = this.data.selidx;
        var pagenum = this.pagenum;
        var totaltype = this.totaltype;
        app.sendRequest({
            url: '/disweb/lowerLevelList',
            method: 'post',
            data: {
                openid: openid,
                leveltype: type,
                pageNum: pagenum,
                totaltype: totaltype
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.member_list;
                    newdata['member_list'] = oldList.concat(res.list);
                    newdata['nothing'] = true;
                    if (totaltype == 0) {
                        var topArr = that.data.topArr;
                        topArr[0].num = res.onenums;
                        topArr[1].num = res.twonums;
                        newdata['topArr'] = topArr;
                    }
                    that.setData(newdata);
                } else {
                    that.setData({
                        nothing: true
                    });
                }
                that.totaltype = 1;
            }
        })
    },
    loadmore: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
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
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    }
})