var express = require('express');
var router = express.Router();
var core = require('../config/core');

var index = require('../controllers/index');

//首页
router.use(function(req, res, next) {
  console.log('首页: ' + Date.now());
  res.locals.Path = 'index';
  next();
});

//内容列表
router.route('/').get(index.list);
//添加
router.route('/add').all(index.add);
//单个
router.route('/:id/one').get(index.one);
//编辑
router.route('/:id/edit').all(index.edit);
//删除
router.route('/:id/del').all(index.del);

//ajax添加
router.route('/addAjax').all(index.addAjax);
//ajax列表页面
router.route('/listPage').all(index.listPage);
//ajax列表请求数据
router.route('/listAjax').all(index.listAjax);

module.exports = function(app) {
  //app.get('/listAjax',index.listAjax);
  var path = core.translateAdminDir('/');
  app.use(path, router);
};
