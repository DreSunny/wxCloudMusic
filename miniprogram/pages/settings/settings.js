// pages/settings/settings.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //用户对象
    userInfo: {}
  },

  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    //页面初始加载时将用户信息写入全局变量
    this.setData({
      userInfo: app.globalData.userInfo
    })
    //初始化标题
    var title = options.title
    if (title) {
      //将传入的标题写入配置
      wx.setNavigationBarTitle({
        title: title,
      })
    }
  },
  //返回本页后刷新页面 并重新注入用户信息
  onShow: function () {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  toOrder() {
    var userInfo = this.data.userInfo;
    if (!userInfo || !userInfo.wechatUserData.admin) {
      wx.showModal({
        title: '提示',
        content: '您还没有登陆或者您没有此权限',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/settings/settings',
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/order/order',
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})