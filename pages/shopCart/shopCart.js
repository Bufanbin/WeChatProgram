var app = getApp();
Page({
    is_city: 0,
    data: {
        edit: false,
        balance: '0.00',
        total: 0,
        selectedAllStatus: false,
        delPageShow: false,
        delSidx: -1,
        delIdx: -1,
        carts: []
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#f52525'
        })
        app.addIplog();
        app.checkLogin();
    },
    onShow: function () {
        app.setPageUserInfo();
        this.initData();
    },
    dataInitial: function () { },
    bindEdit: function () {
        var edit = this.data.edit;
        this.setData({
            edit: !edit
        });
    },
    bindDelete: function () {
        this.setData({
            delPageShow: true
        });
    },
    bindCheckbox: function (e) {
        var that = this;
        var sindex = parseInt(app.getset(e).sindex);
        var index = parseInt(app.getset(e).index);
        var type = app.getset(e).type;
        var carts = this.data.carts;
        var status = carts[sindex].list[index].status;
        var num = parseInt(carts[sindex].list[index].nums);
        var price = carts[sindex].list[index].price;
        var total = this.data.total;
        var balance = parseFloat(this.data.balance);
        var select = 0;
        if (!status) {
            var selectedAllStatus = true;
            for (var i1 = 0; i1 < carts.length; i1++) {
                for (var i2 = 0; i2 < carts[i1].list.length; i2++) {
                    if (i2 != index) {
                        if (!carts[i1].list[i2].status) {
                            selectedAllStatus = false;
                            break;
                        }
                    }
                }
            }
            that.setData({
                balance: (balance + num * price).toFixed(2),
                total: num + total,
                [`carts[${sindex}].list[${index}].status`]: !status,
                selectedAllStatus: selectedAllStatus
            });
            select = 1;
        } else {
            that.setData({
                balance: (balance - num * price).toFixed(2),
                total: total - num,
                [`carts[${sindex}].list[${index}].status`]: !status,
                selectedAllStatus: false
            });
        }
        var shopArr = [{
            id: carts[sindex].list[index].id,
            status: select,
            type: type
        }];
        app.sendRequest({
            url: '/webapp/changeStatus',
            method: 'post',
            data: {
                goodsArr: JSON.stringify(shopArr)
            },
            success: function (res) {
            }
        })
    },
    bindSelectAll: function () {
        var that = this;
        var carts = that.data.carts;
        var selectedAllStatus = this.data.selectedAllStatus;
        var balance = 0;
        var total = 0;
        var shopArr = [];
        if (!selectedAllStatus) {
            for (var i1 = 0; i1 < carts.length; i1++) {
                for (var i2 = 0; i2 < carts[i1].list.length; i2++) {
                    if (carts[i1].list[i2].overdue != 1 && carts[i1].list[i2].is_end != 2 && carts[i1].list[i2].is_end != 3) {
                        carts[i1].list[i2].status = !selectedAllStatus;
                        total += parseInt(carts[i1].list[i2].nums);
                        balance += (carts[i1].list[i2].price * carts[i1].list[i2].nums);
                        var item = {
                            id: carts[i1].list[i2].id,
                            status: 1,
                            type: carts[i1].list[i2].type
                        };
                        shopArr.push(item);
                    }
                }
            }
        } else {
            for (var i1 = 0; i1 < carts.length; i1++) {
                for (var i2 = 0; i2 < carts[i1].list.length; i2++) {
                    if (carts[i1].list[i2].overdue != 1) {
                        carts[i1].list[i2].status = !selectedAllStatus;
                        var item = {
                            id: carts[i1].list[i2].id,
                            status: 0,
                            type: carts[i1].list[i2].type
                        };
                        shopArr.push(item);
                    }
                }
            }
        }
        app.sendRequest({
            url: '/webapp/changeStatus',
            method: 'post',
            data: {
                goodsArr: JSON.stringify(shopArr)
            },
            success: function (res) {
            }
        })
        this.setData({
            balance: balance.toFixed(2),
            total: total,
            selectedAllStatus: !selectedAllStatus,
            carts: carts
        });
    },
    bindMinus: function (e) {
        var sindex = parseInt(app.getset(e).sindex);
        var index = parseInt(app.getset(e).index);
        var carts = this.data.carts;
        var num = carts[sindex].list[index].nums;
        var total = this.data.total;
        var balance = parseFloat(this.data.balance);
        if (num <= 1) {
            return;
        }
        num--;
        if (carts[sindex].list[index].status) {
            total--;
            balance -= parseFloat(carts[sindex].list[index].price);
        }
        carts[sindex].list[index].nums = num;
        this.changeNum(carts[sindex].list[index].id, num, carts[sindex].list[index].type);
        this.setData({
            carts: carts,
            total: total,
            balance: balance.toFixed(2)
        });
    },
    bindPlus: function (e) {
        var sindex = parseInt(app.getset(e).sindex);
        var index = parseInt(app.getset(e).index);
        var carts = this.data.carts;
        var num = carts[sindex].list[index].nums;
        var total = this.data.total;
        var balance = parseFloat(this.data.balance);
        num++;
        if (carts[sindex].list[index].status) {
            total++;
            balance += parseFloat(carts[sindex].list[index].price);
        }
        carts[sindex].list[index].nums = num;
        this.changeNum(carts[sindex].list[index].id, num, carts[sindex].list[index].type);
        this.setData({
            carts: carts,
            total: total,
            balance: balance.toFixed(2)
        });
    },
    bindDeleteOne: function (e) {
        var sindex = parseInt(app.getset(e).sindex);
        var index = parseInt(app.getset(e).index);
        this.setData({
            delPageShow: true,
            delSidx: sindex,
            delIdx: index
        });
    },
    bindManual: function (e) {
        var value = parseInt(e.detail.value);
        var sindex = parseInt(app.getset(e).sindex);
        var index = parseInt(app.getset(e).index);
        if (value < 1) {
            value = 1;
        }
        var total = this.data.total;
        var balance = parseFloat(this.data.balance);
        var carts = this.data.carts;
        if (carts[sindex].list[index].status) {
            var num = carts[sindex].list[index].nums;
            var price = carts[sindex].list[index].price;
            if (num > value) {
                total -= (num - value);
                balance -= (num - value) * price;
            } else {
                total += (value - num);
                balance += (value - num) * price;
            }
        }
        carts[sindex].list[index].nums = value;
        this.changeNum(carts[sindex].list[index].id, value, carts[sindex].list[index].type);
        this.setData({
            balance: balance.toFixed(2),
            total: total,
            carts: carts
        })
    },
    createOrder: function () {
        var carid = [];
        var carts = this.data.carts;
        var bindObj;
        var isself;
        var sonid;
        var childid = [];
        var childidOne;
        for (var i1 = 0; i1 < carts.length; i1++) {
            var caridOne = [];
            for (var i2 = 0; i2 < carts[i1].list.length; i2++) {
                if (carts[i1].list[i2].status == 1 && carts[i1].list[i2].is_end != 2 && carts[i1].list[i2].is_end != 3) {
                    if (typeof childidOne == 'undefined') {
                        childidOne = carts[i1].child_id;
                    }
                    if (childidOne != carts[i1].child_id) {
                        app.showModal({
                            content: '亲-不同店铺的商品不能一起下单，谢谢。'
                        });
                        carid = [];
                        childid = [];
                        return;
                    }
                    if (typeof bindObj == 'undefined') {
                        bindObj = carts[i1].list[i2].type;
                        this.is_city = carts[i1].list[i2].is_city;
                    }
                    if (bindObj != carts[i1].list[i2].type) {
                        app.showModal({
                            content: '不同类型的商品不能一起下单'
                        });
                        carid = [];
                        childid = [];
                        return;
                    }
                    if (typeof isself == 'undefined') {
                        isself = carts[i1].list[i2].isself;
                    }
                    if (isself != carts[i1].list[i2].isself) {
                        app.showModal({
                            content: '亲-不同店铺的商品不能一起下单，谢谢。'
                        });
                        carid = [];
                        childid = [];
                        return;
                    } else {
                        if (isself == 1) {
                            if (typeof sonid == 'undefined') {
                                sonid = carts[i1].list[i2].sonid;
                            }
                            if (sonid != carts[i1].list[i2].sonid) {
                                app.showModal({
                                    content: '亲-不同店铺的商品不能一起下单，谢谢。'
                                });
                                carid = [];
                                childid = [];
                                return;
                            }
                        }
                    }
                    if (this.is_city != carts[i1].list[i2].is_city) {
                        app.showModal({
                            content: '不同类型的商品不能一起下单'
                        });
                        carid = [];
                        childid = [];
                        return;
                    }
                    caridOne.push(carts[i1].list[i2].id);
                }
            }
            if (caridOne.length > 0) {
                carid.push(caridOne);
                childid.push(carts[i1].child_id);
            }
        }
        var caridArr = JSON.stringify(carid);
        var childidArr = JSON.stringify(childid);
        var is_city = this.is_city;
        if (bindObj == 0 || bindObj == 4 || bindObj == 5 || bindObj == 6) {
            var url = '/dianshang/createOrder/createOrder?carid=' + caridArr + '&bindObj=' + bindObj + '&childidArr=' + childidArr + '&is_city=' + is_city;
        } else if (bindObj == 2) {
            var url = '/dianshang/settlement/settlement?carid=' + caridArr + '&bindObj=' + bindObj + '&childidArr=' + childidArr;
        } else if (bindObj == 7) {
            var url = '/dianshang/createOrder/createOrder?carid=' + caridArr + '&bindObj=' + bindObj + '&childidArr=' + childidArr + '&num=1';
        }
        app.turnToPage(url);
    },
    cancelDel: function () {
        this.setData({
            delPageShow: false,
            delSidx: -1,
            delIdx: -1
        });
    },
    sureDel: function () {
        var that = this;
        var sindex = this.data.delSidx;
        var index = this.data.delIdx;
        var carts = this.data.carts;
        var balance = parseFloat(this.data.balance);
        var total = this.data.total;
        var newdata = {};
        if (index != -1) {
            app.sendRequest({
                url: '/webapp/delOnegoods',
                method: 'post',
                data: {
                    good_id: carts[sindex].list[index].id
                },
                success: function (res) {
                    that.initData();
                }
            })
        } else {
            var delArr = [];
            for (var i1 = 0; i1 < carts.length; i1++) {
                for (let i2 = 0; i2 < carts[i1].list.length; i2++) {
                    if (carts[i1].list[i2].status) {
                        total -= carts[i1].list[i2].nums;
                        balance -= carts[i1].list[i2].price * carts[i1].list[i2].nums;
                        delArr.push(carts[i1].list[i2].id);
                    }
                }
            }
            app.sendRequest({
                url: '/webapp/delCarsgood',
                method: 'post',
                data: {
                    goodsArr: JSON.stringify(delArr)
                },
                success: function (res) {
                    that.initData();
                }
            })
            newdata['selectedAllStatus'] = false;
        }
        newdata['delSidx'] = -1;
        newdata['delIdx'] = -1;
        newdata['delPageShow'] = false;
        newdata['carts'] = carts;
        newdata['total'] = total;
        newdata['balance'] = balance.toFixed(2);
        this.setData(newdata);
    },
    backhome: function () {
        app.backhome();
    },
    initData: function () {
        wx.setNavigationBarTitle({
            title: '购物车'
        })
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/webapp/newshopCars',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                if (res.code == 1) {
                    var balance = 0,
                        total = 0,
                        selectedAllStatus = true;
                    for (var i1 = 0; i1 < res.goodlist.length; i1++) {
                        for (var i2 = 0; i2 < res.goodlist[i1].list.length; i2++) {
                            if (res.goodlist[i1].list[i2].status == 1 && res.goodlist[i1].list[i2].is_end != 2 && res.goodlist[i1].list[i2].is_end != 3) {
                                total += parseInt(res.goodlist[i1].list[i2].nums);
                                balance += parseFloat(res.goodlist[i1].list[i2].price) * parseInt(res.goodlist[i1].list[i2].nums);
                            } else {
                                selectedAllStatus = false;
                            }
                        }
                    }
                    that.setData({
                        carts: res.goodlist,
                        total: total,
                        balance: balance.toFixed(2),
                        selectedAllStatus: selectedAllStatus,
                        pageshow: true
                    });
                } else {
                    that.setData({
                        carts: [],
                        pageshow: true,
                        selectedAllStatus: false,
                        total: 0.00,
                        balance: 0
                    });
                }
            }
        })
    },
    changeNum: function (id, num, type) {
        app.sendRequest({
            url: '/webapp/changeNums',
            method: 'post',
            data: {
                good_id: id,
                nums: num,
                type: type
            },
            success: function (res) {
            }
        })
    },
    goToDetail: function (e) {
        var goodid = app.getset(e).goodid;
        var type = app.getset(e).type;
        var sonid = app.getset(e).sonid || 0;
        var isself = app.getset(e).isself || 0;
        var timestr = app.getset(e).timestr;
        var childid = app.getset(e).childid;
        if (type == 4) {
            var url = '/dianshang/seckillDetail/seckillDetail?id=' + goodid + '&timestr=' + timestr + '&childid=' + childid;
        } else if (type == 5) {
            var url = '/dianshang/newseckillDetail/newseckillDetail?id=' + goodid + '&childid=' + childid;
        } else if (type == 6 || type == 7) {
            var num = 0;
            if (type == 7) {
                num = 1;
            }
            var url = "/dianshang/distDetail/distDetail?id=" + goodid + '&disgrade=' + app.globalData.disgrade + '&childid=' + childid + '&num=' + num;
        } else {
            var url = '/dianshang/goodsDetail/goodsDetail?id=' + goodid + '&bindObj=' + type + '&sonid=' + sonid + '&isself=' + isself + '&childid=' + childid;
        }
        app.turnToPage(url);
    },
    emptyevent: function () {
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