var app = getApp();
Page({
    data: {
        issend: false,
        second: 60,
        isset: false,
        num: 0,
        telnum: '',
        checknum: '',
        qqnum: '',
        stelnum: '',
        schecknum: '',
        sqqnum: '',
        tipText: '',
        is_check: 0,
        namenum: '',
        snamenum: ''
    },
    onLoad: function (e) {
        var num = e.num;
        var is_check = e.is_check;
        this.setData({
            num: num,
            is_check: is_check
        });
        var text = e.text;
        if (text && text != 'null') {
            if (num == 0) {
                this.setData({
                    stelnum: text,
                    telnum: text
                })
                if (is_check == 0) {
                    this.setData({
                        isset: true
                    })
                }
            } else if (num == 1) {
                this.setData({
                    sqqnum: text,
                    qqnum: text,
                    isset: true
                })
            } else {
                this.setData({
                    snamenum: text,
                    namenum: text,
                    isset: true
                })
            }
        }
    },
    enterInfo: function (e) {
        var num = this.data.num;
        var type = app.getset(e).type;
        var val = e.detail.value.trim();
        if (num == 0) {
            var is_check = this.data.is_check;
            if (type == 'phone') {
                this.setData({
                    telnum: val
                })
                if (is_check == 0) {
                    var telnum = this.data.telnum;
                    if (telnum) {
                        this.setData({
                            isset: true
                        })
                    } else {
                        this.setData({
                            isset: false
                        })
                    }
                }
            } else if (type == 'code') {
                this.setData({
                    checknum: val
                })
                var telnum = this.data.telnum;
                var checknum = this.data.checknum;
                if (checknum && telnum) {
                    this.setData({
                        isset: true
                    })
                } else {
                    this.setData({
                        isset: false
                    })
                }
            }
        } else if (num == 1) {
            this.setData({
                qqnum: val
            })
            var qqnum = this.data.qqnum;
            if (qqnum) {
                this.setData({
                    isset: true
                })
            } else {
                this.setData({
                    isset: false
                })
            }
        } else {
            this.setData({
                namenum: val
            })
            var namenum = this.data.namenum;
            if (namenum) {
                this.setData({
                    isset: true
                })
            } else {
                this.setData({
                    isset: false
                })
            }
        }
    },
    sendCode: function (e) {
        var telnum = this.data.telnum;
        if (!telnum) {
            app.openTip('请输入手机号码');
            return false;
        }
        var that = this;
        app.sendRequest({
            url: '/webapp/send_phone_code',
            method: 'post',
            data: {
                phone: telnum
            },
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        issend: true
                    })
                    var second = that.data.second;
                    var timer = setInterval(function () {
                        second--;
                        that.setData({
                            second: second
                        })
                        if (second < 0) {
                            clearInterval(timer);
                            that.setData({
                                issend: false,
                                second: 60
                            })
                        }
                    }, 1000);
                } else {
                    app.showModal({
                        content: res.msg
                    })
                }
            }
        })
    },
    saveInfo: function (e) {
        var that = this;
        var telnum = '';
        var checknum = '';
        var qqnum = '';
        var namenum = '';
        var reg = /^1[1|2|3|4|5|6|7|8|9]\d{9}$/;
        var num = this.data.num;
        var is_check = this.data.is_check;
        var input_type = 0;
        if (num == 0) {
            input_type = 0;
            telnum = this.data.telnum;
            if (!telnum) {
                app.openTip('请输入手机号码');
                return false;
            }
            if (!reg.test(telnum)) {
                app.openTip('请输入正确的手机号码');
                return false;
            }
            if (is_check == 1) {
                input_type = 2;
                checknum = this.data.checknum;
                if (!checknum) {
                    app.openTip('请输入验证码');
                    return false;
                }
            }
        } else if (num == 1) {
            input_type = 1;
            qqnum = this.data.qqnum;
            if (!qqnum) {
                app.openTip('请输入QQ号');
                return false;
            }
        } else {
            input_type = 3;
            namenum = this.data.namenum;
            if (!namenum) {
                app.openTip('请输入姓名');
                return false;
            }
        }
        app.sendRequest({
            url: '/webapp/saveBaseInfo',
            method: 'post',
            data: {
                phone: telnum,
                qq: qqnum,
                check_code: checknum,
                input_type: input_type,
                name: namenum
            },
            success: function (res) {
                if (res.code == 1) {
                    app.showModal({
                        content: '保存成功',
                        confirm: function () {
                            wx.navigateBack();
                        }
                    })
                } else {
                    app.showModal({
                        content: res.msg
                    })
                }
            }
        })
    },
    getPhoneNumber(e) {
        var that = this;
        var iv = e.detail.iv;
        var encryptedData = e.detail.encryptedData;
        if (iv && encryptedData) {
            wx.login({
                success(res) {
                    if (res.code) {
                        app.sendRequest({
                            url: '/webapp/getCode',
                            method: 'post',
                            data: {
                                code: res.code
                            },
                            success: function (res) {
                                that.decodephone(iv, encryptedData, res.code);
                            }
                        })
                    }
                },
            })
        }
    },
    decodephone: function (iv, encryptedData, code) {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/webapp/decryptData',
            method: 'post',
            data: {
                iv: iv,
                encryptedData: encryptedData,
                openid: openid,
                code: code
            },
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        stelnum: res.telnum,
                        telnum: res.telnum,
                        isset: true
                    })
                }
            }
        })
    },
})