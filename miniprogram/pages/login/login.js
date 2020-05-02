// pages/login/login.js
var util = require('../../utils/utils.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hiddenButton: true
  },

  /**
   *从云端获取资料
   *如果没有获取到则尝试新建用户资料
   */
  onGotUserInfo: function (e) {
    var _this = this
    //需要用户同意授权获取自身相关信息
    if (e.detail.errMsg == "getUserInfo:ok") {
      //将授权结果写入app.js全局变量
      app.globalData.auth['scope.userInfo'] = true
      //登陆中
      wx.showLoading({
        title: '登录中...',
      })
      //尝试获取云端用户信息
      wx.cloud.callFunction({
        name: 'login',
        data: {
          getSelf: true
        },
        success: res => {
          if (res.errMsg == "cloud.callFunction:ok")
            if (res.result) {
              //如果成功获取到
              //将获取到的用户资料写入app.js全局变量
              // console.log(res)
              //用户对象信息
              app.globalData.userInfo = res.result.data
              //用户openId
              app.globalData.userId = res.result.data._id
              //登陆状态
              app.globalData.logged = true
              //隐藏加载框
              wx.hideLoading()
              //跳转主页面
              wx.navigateTo({
                url: '/pages/index/index',
              })

            } else {
              //未成功获取到用户信息
              //调用注册方法
              var date = util.formatTime(new Date());
              _this.register({
                nickName: e.detail.userInfo.nickName,
                gender: e.detail.userInfo.gender,
                avatarUrl: e.detail.userInfo.avatarUrl,
                createTime: date,
                admin: false
              })
            }
        },
        fail: err => {
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
          })
          console.error("login调用失败", err.errMsg)
        }
      })
    } else
      console.log("未授权")
  },

  /**
   * 注册用户信息
   */
  register: function (e) {
    let _this = this
    //调用云函数
    wx.cloud.callFunction({
      //云函数名称
      name: 'login',
      //入参
      data: {
        setSelf: true,
        userData: e
      },
      //成功返回
      success: res => {
        //判断返回结果是否成功 是否存在数据
        if (res.errMsg == "cloud.callFunction:ok" && res.result) {
          //隐藏授权按钮避免二次点击
          _this.setData({
            hiddenButton: true
          })
          //用户数据写入全局变量
          app.globalData.userInfo = e
          app.globalData.userId = res.result._id
          _this.data.registered = true
          //隐藏加载框
          wx.hideLoading()
          //跳转主页面
          wx.navigateTo({
            url: '/pages/index/index'
          })
        } else {
          console.log("注册失败", res)
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '请检查网络您的状态',
          duration: 800,
          icon: 'none'
        })
        console.error("login调用失败", err.errMsg)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let _this = this
    //需要用户同意授权获取自身相关信息
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          //将授权结果写入app.js全局变量
          app.globalData.auth['scope.userInfo'] = true
          //登陆中
          wx.showLoading({
            title: '登录中...',
          })
          //从云端获取用户资料
          wx.cloud.callFunction({
            name: 'login',
            data: {
              getSelf: true
            },
            success: res => {
              if (res.errMsg == "cloud.callFunction:ok" && res.result) {
                //如果成功获取到
                //将获取到的用户资料写入app.js全局变量
                // console.log(res)
                app.globalData.userInfo = res.result.data
                app.globalData.userId = res.result.data._id
                wx.hideLoading()
                wx.navigateTo({
                  url: '/pages/index/index'
                })
              } else {
                _this.setData({
                  hiddenButton: false
                })
                console.log("未注册")
              }
            },
            fail: err => {
              _this.setData({
                hiddenButton: false
              })
              wx.showToast({
                title: '请检查网络您的状态',
                duration: 800,
                icon: 'none'
              })
              console.error("login调用失败", err.errMsg)
            }
          })
        } else {
          _this.setData({
            hiddenButton: false
          })
          console.log("未授权")
        }
      },
      fail(err) {
        _this.setData({
          hiddenButton: false
        })
        wx.showToast({
          title: '请检查网络您的状态',
          duration: 800,
          icon: 'none'
        })
        console.error("wx.getSetting调用失败", err.errMsg)
      }
    })
  }
})