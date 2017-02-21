'use strict';
//在模型脚本中可以直接require ／server/server 获得app对象，一旦你获得了app对象，你可以通过app的models属性轻易得到你想要的模型对象。
// var loopback = require('loopback');
var app = require('../server.js');
// var LoopBackContext = require('loopback-context');

module.exports = function (Factionrank) {
  //定义一个简单的远程方法
  Factionrank.greet = function (msg, cb) {
    //然后使用Factionrank.app获取到app对象
    var app = Factionrank.app;
    //获取datasources
    // var datasources = app.datasources.db;

    //一旦你在config.js中启用了context，你可以通过使用loopback.getCurrentContext()来获取当前上下文对象
    // var ctx = LoopBackContext.getCurrentContext(); //context默认去除，官方说有很多bug，建议使用loopback-context，详情http://loopback.io/doc/en/lb2/Using-current-context.html#configure-context-propagation
    // console.log(ctx);
    // var currentUser = ctx && ctx.get('currentUser');
    // console.log('currentUser.username: ', currentUser.username); // voila!
    // // Set more information on current context
    // ctx.set('foo', { bar: 'val' } );
    //地址：https://github.com/strongloop/loopback/issues/878

    // console.log(app.models.factionlists.find({}));
    cb(null, 'Greetings... ' + msg);
  };

  //使用remoteMethod去注册远程方法
  Factionrank.remoteMethod(
    'greet', {
      accepts: {
        arg: 'msg',
        type: 'string'
      },
      returns: {
        arg: 'greeting',
        type: 'string'
      }
    }
  );

  //单独获取起点小说排行榜
  Factionrank.getRank = function (rankType, cb) {
    var app = Factionrank.app;
    var resultArr = [];
    app.models.factionranks.find(function (err, sourceData) {
      if(err){
        console.log('访问排行榜数据库失败...'+err);
        return;
      }
      if(rankType == 'qd'){
        sourceData.forEach(function(item){
          app.models.factionlists.find({}, '_id factionName author', function(err, res){
            if(err){
              console.log('getRank中查询factionlists失败....');
              return;
            }
            item.qdRank.forEach(function(bookItem, bookIndex){
              var isBookExist = res.some(function(allBooksItem, allBooksIndex){
                return allBooksItem.factionName == bookItem.factionName && allBooksItem.author == bookItem.author;
              });
            });
          });
          resultArr.push({standard: item.standard, engName: item.engName, qdRank: item.qdRank});

          item.qdRank.forEach(function(bookItem, bookIndex){
            isBookExist(bookItem.factionName. bookItem)
          });
        });
      }else if(rankType == 'zh'){
        sourceData.forEach(function(item){
          resultArr.push({standard: item.standard, engName: item.engName, zhRank: item.zhRank});
        });
      }else{
        console.log('The param of getRank is error!....');
      }
      cb(null, resultArr);
    });

    // 判断书籍是否存在，不存在的话就创建一本
    function isBookExist(factionName, author){
      app.models.factionlists.find({factionName: factionName, author: author}, '_id', function(err, res){
        if(err){
          console.log('getRank中查询factionlists失败....');
          return;
        }
        console.log(res);
      });
    }
  };

  //使用remoteMethod去注册远程方法
  Factionrank.remoteMethod(
    'getRank', {
      accepts: {
        arg: 'rankType',
        type: 'string',
        description: 'qd,zh'
      },
      returns: {
        arg: 'data',
        type: 'array',
        description: '返回的结果数组'
      },
      http: {path: '/getRank', verb: 'get'}
    });
};
