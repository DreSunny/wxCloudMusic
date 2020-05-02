// pages/settings/UserManage/UserManage.js
var dbName = 'user'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum: 1,
    pageSize: 20,
    hasMore: true,
    list: [],
    showModalStatus: false,
    user: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //初始化标题
    var title = options.title
    if (title) {
      wx.setNavigationBarTitle({
        title: title,
      })
    }
    //初始化查询方法
    that.getContentInfo('正在加载数据', {})//读取信息
  },
  /**
   * 删除用户
   */
  delData: function (e) {
    var that = this
    //获取单词id
    var id = e.currentTarget.dataset.id
    //删除前弹窗提示
    wx.showModal({
      title: '警告',
      content: '您确定删除这条数据吗？',
      success: function (res) {
        //这里是点击了确定以后
        if (res.confirm) {
          //调用云函数删除单词
          wx.cloud.callFunction({
            name: 'doData',
            data: {
              dbName: dbName,
              options: 'del',
              id: id
            },
            success: res => {
              var data = {
                title: that.data.title
              }
              //成功后重新导入页面
              that.setData({
                pageNum: that.data.pageNum - 1
              })
              that.onLoad(data);
            }
          })
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 查询用户详情
   */
  detailData: function (e) {
    //获取入参信息
    var item = e.currentTarget.dataset.id
    //性别
    var gender = item.gender
    //是否管理员
    var admin = item.admin
    item.gender = gender == 1 ? '男' : '女'
    item.admin = admin == true ? '是' : '否'
    this.setData({
      showModalStatus: true,
      user: item
    })
  },
  powerDrawer: function () {
    this.setData({
      showModalStatus: false,
      user: {}
    })
  },
  /**
   * 封装加载数据方法
   */
  getContentInfo: function (message, where) {
    //加载中显示信息
    wx.showLoading({
      title: message,
    })
    //调用加载数据方法
    this.getDataList(this.data.pageSize, this.data.pageNum, dbName, where);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.data.pageNum = 1
    this.getContentInfo('正在刷新数据')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.getContentInfo('加载更多数据')
    } else {
      wx.showToast({
        title: '没有更多数据',
      })
    }
  },
  /**
    * 获取数据库单词列表数据
    * @param pageSize 每条条数
    * @param pageNum 第几页
    * @param type  数据库名称（集合名称）
    * @param where 查询条件
    */
  getDataList: function (pageSize, pageNum, type, where) {
    var that = this
    //调用云函数读取数据库数据 自定义分页函数
    wx.cloud.callFunction({
      name: 'getData',
      data: {
        dbName: type,
        pageIndex: pageNum,
        pageSize: pageSize,
        filter: {},
        orderfiled: 'createTime'
      },
      success: res => {
        //判断云函数是否返回成功
        if (res.errMsg == "cloud.callFunction:ok") {
          //隐藏各加载弹框组件
          wx.hideLoading();
          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
          //将获取到的数据放在变量里
          var data = res.result.data;
          //下一步应该加载的页数
          var nowPageNum = that.data.pageNum + 1;
          if (res.result.hasMore) {
            that.setData({
              list: data,
              hasMore: true,
              pageNum: nowPageNum
            })
          } else {
            that.setData({
              list: data,
              hasMore: false
            })
          }
        }
      }
    })
  }
})