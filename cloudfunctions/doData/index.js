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
  //数据id
  var id = event.id;
  //数据
  var data = event.data;
  //集合名称
  var dbName = event.dbName;
  //操作名称
  var options = event.options;
  //修改的对象
  var object = event.object;
  //集合名称
  const collections = db.collection(dbName);
  //
  const _ = db.command
  try {
    //判断要进行哪种操作
    if (options == 'del') {
      return await collections.doc(id).remove();
    }
    else if (options == 'add') {
      return await collections.add({ data: data });
    } else if (options == 'update') {
      if (object === 'typedata') {
        return await collections.doc(id).update({
          data: {
            typedata: _.set(data)
          }
        })
      } else {
        return await collections.doc(id).update({
          data: {
            tasdata: _.set(data)
          }
        })
      }

    }
  } catch (e) {
    console.log(e)
  }

}