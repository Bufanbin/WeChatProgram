var app = getApp();
var img = { path: '', width: 0, height: 0 };
var img1 = { path: '', width: 0, height: 0 };
var img2 = { path: '', width: 0, height: 0 };
var dislevel;
var sharetitle = '';
var shareimg = '';
Page({
    data: {
        isdis: false,
        loaded: false,
        showShare: false,
        showPic: false,
        showTip: false,
        wxhy_icon_pic: app.globalData.siteBaseUrl + '/static/user/images/wxhy_icon.png',
        pyq_icon_pic: app.globalData.siteBaseUrl + '/static/user/images/pyq_icon.png',
    },
    onLoad: function () {
        app.addIplog();
        app.checkLogin();
        dislevel = app.globalData.dislevel;
        this.setData({
            dislevel: dislevel
        })
    },
    onShow: function () {
        app.setPageUserInfo();
        var timer = setInterval(() => {
            var openid = app.getSessionKey();
            if (openid) {
                this.loadData();
                clearInterval(timer);
            }
        }, 10)
    },
    dataInitial: function () {
    },
    onShareAppMessage: function () {
        var pageRouter = app.getHomepageRouter();
        var dis_uid = this.data.dis_uid || 0;
        app.addShareLog();
        return {
            title: sharetitle,
            imageUrl: shareimg,
            path: '/pages/' + pageRouter + '/' + pageRouter + '?scene=;' + dis_uid + ';',
            success: function (res) {
            }
        }
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/disweb/myDisdata',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    if (res.setsahre == 1) {
                        sharetitle = res.sharecard.title;
                        shareimg = res.sharecard.image;
                    } else {
                        sharetitle = app.getAppTitle();
                    }
                    if (res.is_disuser == 1) {
                        newdata['isdis'] = true;
                        newdata['lowerLevel'] = res.lowerLevel;
                        newdata['total_income'] = res.total_income;
                        newdata['usernums'] = res.usernums;
                        newdata['disorderNums'] = res.disorderNums;
                        newdata['disorderMoney'] = res.disorderMoney;
                        newdata['postset'] = res.postset || {};
                        newdata['qrcodeurl'] = res.qrcodeurl || '';
                        newdata['storeinfo'] = res.storeinfo || {};
                        newdata['dis_uid'] = res.dis_uid;
                        if (res.posturl) {
                            that.dowmloadPost(res.posturl);
                        }
                    } else {
                        newdata['isdis'] = false;
                        newdata['hasphone'] = res.hasphone;
                        newdata['isblack'] = res.is_black;
                        newdata['applybg'] = res.applyinfo.apply_bg;
                        newdata['apply_btncolor'] = res.applyinfo.apply_btncolor;
                        newdata['apply_txtcolor'] = res.applyinfo.apply_txtcolor;
                        newdata['isapply'] = res.isapply;
                    }
                    newdata['loaded'] = true;
                    that.setData(newdata);
                    if (!res.posturl && res.is_disuser == 1) {
                        that.downData(res);
                    }
                }
            }
        })
    },
    downData: function (data) {
        if (!data.storeinfo) {
            return;
        }
        var bg = data.postset.background_pic;
        var qrcodeurl = data.qrcodeurl;
        var logo = data.storeinfo.logo;
        var date = new Date();
        var time = date.getTime();
        if (!logo) {
            app.toast({ title: '请先设置店铺信息' });
            return;
        }
        wx.downloadFile({
            url: bg,
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
            url: qrcodeurl + '?t=' + time,
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
            url: logo,
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
        });
    },
    dowmloadPost: function (posturl) {
        var that = this;
        wx.downloadFile({
            url: posturl,
            success: function (res) {
                that.setData({
                    posturl: res.tempFilePath
                })
            }
        });
    },
    goToApply: function () {
        var hasphone = this.data.hasphone;
        var isblack = this.data.isblack;
        if (isblack) {
            app.toast({ title: '您已被拉黑，无法重新申请' });
        } else {
            if (hasphone) {
                var url = '/dianshang/disApply/disApply';
                app.turnToPage(url);
            } else {
                app.showModal({
                    title: ' ',
                    content: '您的个人信息未完善，请到 个人中心-个人信息 页面进行完善',
                    showCancel: true,
                    confirmText: '点我跳转',
                    confirm: function () {
                        var url = '/pages/userinfo/userinfo';
                        app.turnToPage(url);
                    }
                })
            }
        }
    },
    spread_app: function () {
        var storeinfo = this.data.storeinfo;
        var posturl = this.data.posturl;
        if (JSON.stringify(storeinfo) == "{}" && !posturl) {
            app.toast({ title: '请先设置店铺信息' });
            return;
        }
        this.setData({
            showShare: true
        });
    },
    spread_preduct: function () {
        var url = '/dianshang/disProduct/disProduct';
        app.turnToPage(url);
    },
    goToSahre: function () {
        var posturl = this.data.posturl;
        if (posturl) {
            this.showSharePic();
        } else {
            this.composePic();
        }
    },
    composePic: function () {
        if (!img.path || !img1.path || !img2.path) {
            app.toast({ title: '图片下载中，请稍等···' });
            return;
        }
        var postset = this.data.postset;
        var scolor = postset.storename_color;
        var stop = postset.storename_top;
        var sleft = postset.storename_left;
        var sname = this.data.storeinfo.storename;
        var ltop = postset.logo_top;
        var lleft = postset.logo_left;
        var lwidth = postset.logo_width;
        var lheight = postset.logo_height;
        var qtop = postset.qrcode_top;
        var qleft = postset.qrcode_left;
        var qwidth = postset.qrcode_width;
        var qheight = postset.qrcode_height;
        var ctx = wx.createCanvasContext('myCanvas');
        ctx.drawImage(img.path, 0, 0, img.width, img.height, 0, 0, 640, 1008);
        ctx.drawImage(img1.path, 0, 0, img1.width, img1.height, qleft, qtop, qwidth, qheight);
        ctx.save();
        ctx.arc(lleft + lwidth / 2, ltop + lwidth / 2, lwidth / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img2.path, 0, 0, img2.width, img2.height, lleft, ltop, lwidth, lheight);
        ctx.restore();
        ctx.setFontSize(30);
        ctx.setFillStyle(scolor);
        ctx.setTextAlign('center');
        ctx.fillText(sname, sleft + sname.length * 15, stop + 30)
        ctx.draw();
        ctx.save();
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
                        posturl: res.tempFilePath
                    });
                    that.uploadImg(res);
                    that.showSharePic();
                },
                fail: function (res) {
                }
            })
        }, 1000);
    },
    showSharePic: function () {
        this.setData({
            showPic: true,
        })
        this.hideShare();
    },
    hideShare: function () {
        this.setData({
            showShare: false
        })
    },
    savePic: function () {
        var that = this;
        var tempFilePath = this.data.posturl;
        if (!tempFilePath) {
            return;
        }
        wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success(res) {
                app.toast({ title: '保存成功' });
                that.hidePic();
            },
            fail: function (res) {
                if (res.errMsg == 'saveImageToPhotosAlbum:fail auth deny' || res.errMsg == 'saveImageToPhotosAlbum:fail auth denied' || res.errMsg == 'saveImageToPhotosAlbum:fail authorize no response') {
                    that.setData({
                        showTip: true
                    })
                }
            }
        })
    },
    hidePic: function () {
        this.setData({
            showPic: false
        })
    },
    emptyEvent: function () {
    },
    uploadImg: function (res) {
        var dis_uid = this.data.dis_uid;
        var app_id = app.getAppId();
        var filePath = res.tempFilePath;
        wx.uploadFile({
            url: app.globalData.siteBaseUrl + '/disweb/uploadImage',
            filePath: filePath,
            name: 'img_data',
            formData: {
                dis_uid: dis_uid,
                app_id: app_id
            },
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    closeTip: function () {
        this.setData({
            showTip: false
        })
    },
    openSet: function (res) {
        this.closeTip();
        var rres = res.detail;
        if (rres.authSetting['scope.writePhotosAlbum']) {
            this.savePic();
        }
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