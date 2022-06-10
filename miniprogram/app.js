const config = require('./config')

App({

    onLaunch(opts, data) {
        if (data && data.path) {
            wx.navigateTo({
                url: data.path,
            })
        }
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                env: config.envId,
                traceUser: true,
            })
        }
        this.getUserOpenId()
        
    },

    // 获取 openid
    getUserOpenId() {
        let that = this;
        let openid = wx.getStorageSync('openid');
        if (openid) {
            that.globalData.openid = openid
        } else {
            wx.login({
                success(data) {
                    wx.cloud.callFunction({
                        name: 'login',
                        data: {
                            action: 'openid'
                        },
                        success: res => {
                            that.globalData.openid = res.result.openid
                            wx.setStorageSync('openid', res.result.openid);
                        },
                        fail: err => {
                            console.log('拉取用户openid失败，将无法正常使用开放接口等服务', err)
                        }
                    })
                },
                fail(err) {
                    console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
                }
            })
        }
    },
    // 通过云函数获取用户 openid，支持回调或 Promise
    getUserOpenIdViaCloud() {
        return wx.cloud.callFunction({
            name: 'wxContext',
            data: {}
        }).then(res => {
            this.globalData.openid = res.result.openid
            return res.result.openid
        })
    },
    /**
     * 登录验证
     * @param {} cb 
     */
    checkUserInfo: function (cb) {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.globalData.userInfo = res.data
                typeof cb == "function" && cb(that.globalData.userInfo, true);
            }
        })
        if (that.globalData.userInfo) {
            typeof cb == "function" && cb(that.globalData.userInfo, true);
        } else {
            wx.getSetting({
                success: function (e) {
                    if (e.authSetting['scope.userInfo']) {
                        // 已经授权，可以直接调用 getUserProfile 获取头像昵称
                        wx.getUserProfile({
                            desc: '获取你的昵称、头像、地区及性别',
                            lang: 'zh_CN',
                            success: function (res) {
                                that.globalData.userInfo = res.userInfo;
                                wx.setStorage({
                                    key: "userInfo",
                                    data: res.userInfo
                                })
                                typeof cb == "function" && cb(that.globalData.userInfo, true);
                            }
                        })

                    } else {
                        typeof cb == "function" && cb(that.globalData.userInfo, false);

                    }
                }
            })
        }
    },
    globalData: {
        userInfo:null,
        openid: null,
    },
})