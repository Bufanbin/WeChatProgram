var app = getApp();
var orderid, bindObj, childid, is_city;
Page({
    data: {
    },
    onLoad: function (e) {
        app.addIplog();
        app.setPageUserInfo();
        orderid = e.orderid;
        bindObj = e.bindObj || 0;
        childid = e.childid || 0;
        is_city = e.is_city || 0;
        this.loadData();
    },
    selectLevel: function (e) {
        var dataset = app.getset(e);
        var index = dataset.idx;
        var eidx = dataset.eidx;
        this.setData({
            [`evalInfo[${index}].evalGrade`]: eidx
        });
    },
    submitEval: function (e) {
        var evalInfo = this.data.evalInfo;
        var sendinfo = [];
        for (var i = 0; i < evalInfo.length; i++) {
            if (evalInfo[i].evalText == '') {
                app.toast({ title: '请先输入第' + (i + 1) + '个商品评论内容' });
                return;
            }
            var item = {
                spec_str: evalInfo[i].specstr,
                upload_img: evalInfo[i].picList,
                good_id: evalInfo[i].good_id,
                content: evalInfo[i].evalText,
                status: evalInfo[i].evalGrade,
                sonid: evalInfo[i].sonid,
                isself: evalInfo[i].isself
            }
            sendinfo.push(item)
        }
        var openid = app.getSessionKey();
        var avatar = this.data.userInfo.avatarUrl;
        var nickname = this.data.userInfo.nickName;
        app.sendRequest({
            url: '/webapp/addComment',
            method: 'post',
            data: {
                comment: JSON.stringify(sendinfo),
                order_id: orderid,
                openid: openid,
                avatar: avatar,
                nickname: nickname,
                bindObj: bindObj,
                child_id: childid,
                is_city: is_city
            },
            success: function (res) {
                if (res.code == 1) {
                    app.turnBack();
                }
            }
        })
    },
    uploadPic: function (e) {
        var index = app.getset(e).index;
        var that = this;
        var piclist = that.data.evalInfo[index].picList;
        app.chooseImage(function (res) {
            piclist.push(res);
            that.setData({
                [`evalInfo[${index}].picList`]: piclist
            })
        }, 5);
    },
    enterEval: function (e) {
        var val = e.detail.value;
        var index = app.getset(e).index;
        this.setData({
            [`evalInfo[${index}].evalText`]: val
        })
    },
    previewPic: function (e) {
        var url = e.target.dataset.picpath;
        wx.previewImage({
            current: '',
            urls: url
        });
    },
    removePic: function (e) {
        var idx = app.getset(e).idx;
        var pidx = app.getset(e).pidx;
        var piclist = this.data.evalInfo[idx].picList;
        piclist.splice(pidx, 1);
        this.setData({
            [`evalInfo[${idx}].picList`]: piclist
        })
    },
    backhome: function () {
        app.backhome();
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/goodsComment',
            method: 'post',
            data: {
                order_id: orderid,
                bindObj: bindObj
            },
            success: function (res) {
                var evalInfo = res.goods;
                for (var i = 0; i < evalInfo.length; i++) {
                    evalInfo[i].evalGrade = 0;
                    evalInfo[i].evalLevel = [
                        { name: '好评', icon: 'icon-haoping' },
                        { name: '中评', icon: 'icon-zhongping' },
                        { name: '差评', icon: 'icon-chaping' },
                    ];
                    evalInfo[i].evalText = '';
                    evalInfo[i].picList = [];
                }
                that.setData({
                    evalInfo: evalInfo,
                    pageshow: true
                })
            }
        })
    }
})