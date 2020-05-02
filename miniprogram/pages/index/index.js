var baseUrl = require('../../utils/api.js');
var common = require("../../utils/util.js");
var WxNotificationCenter = require("../../utils/WxNotificationCenter.js")
var app = getApp();
const LOAD_LIST_NUM = 10 // 每次请求的博客数量
let keyword = '' // 搜索的关键字
let isAuthorize = false // 是否授权
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // tab切换
        currentTab: 1,
        // 轮播图数据
        banner: [],
        // 推荐歌单数据
        personalized: [],
        // 推荐新音乐
        newsong: [],
        // 新碟数据
        newest: [],
        // 播放栏处理
        music: {},
        playing: false,
      blogList: [], // 存放博客页面的博客列表数据
      loveBloglist: [],   // 我喜欢的博客
      isShowPopup: false, // 是否显示授权底部弹窗，默认false不显示
      blogShareImg: ["https://hbimg.huabanimg.com/0f2e924f9f24b483a6d31ee780208a20306f2a3a11750-rFPrzG_fw658",
        "https://hbimg.huabanimg.com/0b95640080a36c0990a811f0f74efb98cb9b512652fc4-6gkC2J_fw658",
        "https://hbimg.huabanimg.com/05f503e79e197232ac0675f4639cd7459ab4b327bdf37-3HoX31_fw658",
        "https://hbimg.huabanimg.com/00ae5f42556f724d5a13aa235d106ed4bf509ced4c75e-xSp6Wk_fw658",
        "https://hbimg.huabanimg.com/1e0006a7fe87dd2a5bc229b791c1578a56976c98e4f8c-yPYjCH_fw658",
        "https://hbimg.huabanimg.com/50e9edef431897c9326f852c4ace4be02c2011a815ecd7-3y7BhI_fw658"
      ]
    },
  // 从数据库中载入数据
  _loadBlogList(start = 0) {
    wx.showLoading({
      title: '拼命加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'list',
        start,
        keyword,
        count: LOAD_LIST_NUM
      }
    }).then((res) => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  // 点击发布按钮时，获取授权信息，如没有授权则弹窗
  onPublish() {
    if (!isAuthorize) {
      wx.showToast({
        title: '检测是否授权',
        mask: true,
        image: '../../images/music-author.png',
        complete() {
          wx.hideToast()
        }
      })
    }
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              isAuthorize = true
              wx.hideToast()
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          wx.hideToast()
          this.setData({
            isShowPopup: true,
          })
          isAuthorize = false
        }
      }
    })
  },
  // 同意授权成功时，进行页面跳转 → 发布编辑页
  onLoginSuccess(event) {
    console.log(event)
    this.setData({
      isShowPopup: false
    })
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?userName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },

  // 拒绝授权
  onLoginFail() {
    wx.showModal({
      title: '用户授权才可以发布博客噢 ',
      showCancel: false,
      confirmText: '回去授权',
      confirmColor: '#d81e06'
    })
  },
    // tab切换处理
    swichNav: function (e) {

        console.log(e);

        var that = this;

        if (this.data.currentTab === e.target.dataset.current) {

            return false;

        } else {

            that.setData({

                currentTab: e.target.dataset.current,

            })

        }

    },

    swiperChange: function (e) {

        console.log(e);

        this.setData({

            currentTab: e.detail.current,

        })


    },

    // 去搜索页面
    openSearch: function (e) {
        wx.navigateTo({
            url: '../search/search',
        })
    },

    // 去播放页面
    toplayview: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../player/player?id=' + id,
        })
    },

    // 打开菜单新页面
    openNewView: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        console.log(id);
        if (id == 0) {
            // 我的喜爱
          wx.navigateTo({
            url: '../songSheet/songSheet?' + "type=3",
          })
        }
        if (id == 1) {
            // 歌单
            wx.navigateTo({
                url: '../gedanSquare/gedanSquare',
            })
        }
        if (id == 2) {
            // 排行榜
            wx.navigateTo({
                url: '../rankingList/rankingList',
            })
        }
        if (id == 3) {
            // 电台
            wx.navigateTo({
                url: '../logs/logs',
            })
        }
        if (id == 4) {
            // 直播
            wx.navigateTo({
                url: '../logs/logs',
            })
        }
    },

    openGedanSquare: function (e) {
        wx.navigateTo({
            url: '../gedanSquare/gedanSquare',
        })
    },

    openNewsong: function (e) {
        wx.navigateTo({
            url: '../newsong/newsong',
        })
    },

    // 打开歌单详情页面
    openSongSheet: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        // console.log("歌单id:" + id);
        wx.navigateTo({
            url: '../songSheet/songSheet?id=' + id + "&type=0",
        })
    },

    /**
     * 获取轮播图数据
     */
    getBanner() {
        let that = this;
        wx.request({
            url: baseUrl + 'banner',
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                // console.log(res);
                if (res.data.code == 200) {
                    that.setData({
                        banner: res.data.banners
                    })
                }
            }
        })
    },

    /**
     * 获取歌单信息
     */
    getPersonalized() {
        let that = this;
        wx.request({
            url: baseUrl + 'personalized?limit=6',
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                if (res.data.code == 200) {
                    let pageData = res.data.result;
                    // 播放量四舍五入精确到万
                    pageData.forEach(function (item, index) {
                        item.playCount = (item.playCount / 10000).toFixed(0)
                    })
                    that.setData({
                        personalized: pageData
                    })

                }
            }
        })
    },

    /**
     * 推荐新音乐
     */
    getNewsong() {
        let that = this;
        wx.request({
            url: baseUrl + 'personalized/newsong',
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                // console.log(res.data.result);
                if (res.data.code == 200) {
                    that.setData({
                        newsong: res.data.result
                    })
                }
            }
        })
    },

    /**
     * 获取新碟信息
     */
    getNewest() {
        let that = this;
        wx.request({
            url: baseUrl + 'album/newest',
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                // console.log(res);
                if (res.data.code == 200) {
                    that.setData({
                        newest: res.data.albums
                    })
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 1、获取轮播图数据
        this.getBanner();
        // 2、获取歌单数据
        this.getPersonalized();
        // 3、获取新碟数据
        this.getNewest();
        // 4、推荐新音乐
        this.getNewsong();
        //获取博客数据
      this._loadBlogList()
    },

    // 播放or暂停
    toggleplay: function () {
        common.toggleplay(this, app);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // 处理播放栏
        WxNotificationCenter.addNotification("music", (res) => {
            this.setData({
                music: res.curPlaying,
                playing: res.playing,
                isShow: res.list_song.length
            });
        }, this)
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
      this.setData({
        blogList: []
      })
      this._loadBlogList(0)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      this._loadBlogList(this.data.blogList.length)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})