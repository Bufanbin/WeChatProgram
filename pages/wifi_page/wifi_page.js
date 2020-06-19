var app = getApp();
Page({
    data: {
        wifiArr: [],
        wifilen: 0,
        selWifi: '',
        isConnect: false,
        wifiname: '',
        linksuccess: true,
        linknow: true,
        linkfail: true,
        logo: [],
        selIdx: 0,
        wifi_single: app.globalData.siteBaseUrl + '/static/user/images/wifi_single.png',
    },
    onLoad: function (options) {
        app.addIplog();
        app.checkLogin();
        wx.startWifi({
            success: function (res) {
            }
        })
        this.getWifi();
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    dataInitial: function () {
    },
    getWifi: function () {
        var that = this;
        wx.getConnectedWifi({
            success: function (res) {
                var name = res.wifi.SSID;
                that.setData({
                    wifiname: name,
                    isConnect: true
                })
            }
        })
    },
    onShareAppMessage: function () {
        return {
            title: app.getAppTitle(),
            desc: app.getAppDescription(),
            path: '/pages/wifi_page/wifi_page',
            success: function (res) {
                app.sendRequest({
                    url: '/webapp/tjIntegral',
                    data: {
                        openid: app.getSessionKey()
                    },
                    method: 'POST',
                    success: function (res) {
                    }
                });
            }
        }
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/webapp/wifiList',
            method: 'post',
            data: {
            },
            success: function (res) {
                if (res.code == 1) {
                    var wifiname = that.data.wifiname;
                    for (var i = 0; i < res.wifiList.length; i++) {
                        if (res.wifiList[i].wifi_name == wifiname) {
                            res.wifiList[i].iselect = true;
                        } else {
                            res.wifiList[i].iselect = false;
                        }
                    }
                    if (res.wifiList.length > 1) {
                        var selWifi = '';
                    } else {
                        var selWifi = res.wifiList[0]
                    }
                    that.setData({
                        wifilen: res.wifiList.length,
                        wifiArr: res.wifiList,
                        selWifi: selWifi,
                        logo: res.logo,
                    })
                }
            }
        })
    },
    connect_wifi: function (res) {
        var that = this;
        var selWifi = this.data.selWifi;
        var wifiArr = this.data.wifiArr;
        var selIdx = this.data.selIdx;
        wx.connectWifi({
            SSID: selWifi.wifi_name,
            BSSID: '',
            password: selWifi.wifi_password,
            success: function (res) {
                wx.getConnectedWifi({
                    success: function (res) {
                        if (res.wifi.SSID == selWifi.wifi_name) {
                            if (wifiArr.length > 1) {
                                for (var i = 0; i < wifiArr.length; i++) {
                                    if (i == selIdx) {
                                        wifiArr[i].iselect = true;
                                    } else {
                                        wifiArr[i].iselect = false;
                                    }
                                }
                                that.setData({
                                    wifiArr: wifiArr
                                })
                            }
                            that.setData({
                                linkfail: true,
                                linksuccess: false,
                                wifilen: 0,
                                wifiname: selWifi.wifi_name,
                            })
                        } else {
                            app.toast({ title: '连接失败' });
                            that.setData({
                                linkfail: false,
                                wifilen: 0
                            })
                        }
                    },
                    fail: function (res) {
                        app.toast({ title: '连接失败' });
                        that.setData({
                            linkfail: false,
                            wifilen: 0
                        })
                    }
                })
            },
            fail: function (res) {
                var str = '';
                if (res.errCode == 12000) {
                    str = '未先调用startWifi接口';
                } else if (res.errCode == 12001) {
                    str = '当前系统不支持此功能';
                } else if (res.errCode == 12003) {
                    str = '连接超时';
                } else if (res.errCode == 12005) {
                    str = '未打开 Wi-Fi 开关';
                } else if (res.errCode == 12006) {
                    str = '未打开 GPS 定位开关';
                } else if (res.errCode == 12008) {
                    str = '无效的WIFI名称';
                } else if (res.errCode == 12002) {
                    str = 'Wi-Fi 密码错误';
                } else if (res.errCode == 12004) {
                    str = '重复连接 Wi-Fi';
                } else if (res.errCode == 12007) {
                    str = '用户拒绝授权链接 Wi-Fi';
                } else if (res.errCode == 12009) {
                    str = '系统运营商配置拒绝连接 Wi-Fi';
                } else if (res.errCode == 12010) {
                    str = '系统其他错误';
                } else if (res.errCode == 12011) {
                    str = '应用在后台无法配置 Wi-Fi';
                } else if (res.errMsg == 'connectWifi:fail the api is only supported in iOS 11 or above') {
                    str = '连接wifi功能仅支持 Android 与 iOS 11 以上版本';
                } else {
                    str = '连接错误'
                }
                app.toast({ title: str });
                that.setData({
                    linkfail: false,
                    wifilen: 0
                })
            }
        })
    },
    goToLink: function (e) {
        var that = this;
        var idx = app.getset(e).idx;
        var wifiArr = this.data.wifiArr;
        wx.getConnectedWifi({
            success: function () {
                that.setData({
                    linkfail: true,
                    selWifi: wifiArr[idx],
                    wifilen: 1,
                    selIdx: idx
                })
            },
            fail: function () {
                that.setData({
                    linkfail: true,
                    selWifi: wifiArr[idx],
                    wifilen: 1
                })
            }
        })
    },
    backTolist: function () {
        var wifiArr = this.data.wifiArr;
        var isConnect = this.data.isConnect
        this.setData({
            linkfail: true,
            linksuccess: true,
            wifilen: wifiArr.length
        })
    },
    backhome: function () {
        app.backhome();
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    closenewgift: function () {
        app.closenewgift();
    }
})