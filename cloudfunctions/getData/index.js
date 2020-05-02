// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

//链接云数据库 初始化单词列表
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var dbName = event.dbName;//集合名称
  var filter = event.filter ? event.filter : {};//筛选条件默认为空
  var orderfiled = event.orderfiled;//排序字段
  var ordertype = event.ordertype ? event.ordertype : 'desc';//排序方式
  if (event.countType == true) {
    const countResult = await db.collection(dbName).where(filter).count()//集合中的总记录数
    const total = countResult.total//得到总记录数
    return total;
  }

  var pageIndex = event.pageIndex ? event.pageIndex : 1;//当前第几页
  var pageSize = event.pageSize ? event.pageSize : 1;//每页多少记录
  const countResult = await db.collection(dbName).where(filter).count()//集合中的总记录数
  const total = countResult.total//得到总记录数
  const totalPage = Math.ceil(total / pageSize)   //计算共多少页
  var hasMore;//提示前端是否还有数据
  if (pageIndex > totalPage || pageIndex == totalPage) {
    //没有数据后返回false
    hasMore = false;
  } else {
    hasMore = true;
  }

  //判断是否存在排序条件
  if (orderfiled) {
    //查询数据并返回给前端
    return db.collection(dbName).where(filter).orderBy(orderfiled, ordertype).skip((pageIndex - 1) * pageSize).limit(pageSize).get()
      .then(res => {
        res.totalPage = totalPage;
        res.hasMore = hasMore;
        return res;
      });
  } else {
    //查询数据并返回给前端
    return db.collection(dbName).where(filter).skip((pageIndex - 1) * pageSize).limit(pageSize).get()
      .then(res => {
        res.totalPage = totalPage;
        res.hasMore = hasMore;
        return res;
      });
  }


}