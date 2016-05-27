'use strict';
var mongoose = require('mongoose'),
    List = mongoose.model('List'),
    core = require('../config/core'),
    _ = require('underscore');

//查询首页列表数据
exports.list = function(req, res) {
    var condition = {};
    List.count(condition, function(err, total) {
        var query = List.find(condition).populate('lists');
        //分页
        var pageInfo = core.createPage(req, total, 5);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        console.info(pageInfo);
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('', {
                title: '首页哈哈',
                lists: results,
                pageInfo: pageInfo
            });
        })
    })
}

//编辑
exports.edit = function(req, res) {
    var id = req.params.id;
    var editHandler = function(list) {
        list.save(function(err, list) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if(err || !list) {
                console.log(err);
                return res.render('error', {
                    message: '更新失败'
                });
            }
            /*res.render('error', {
                message: '更新成功'
            });*/
            var path = core.translateAdminDir('');
            return res.redirect(path);
        })
    };
    if(req.method === 'GET') {
        List.findById(id).populate('lists').exec(function(err, result) {
            if(err || !result) {
                return res.render('error', {
                    message: '出错了'
                });
            }
            res.render('edit', {
                title: 'edit',
                list: result
            });
        });
    } else if(req.method === 'POST') {
        var obj = req.body;
        List.findById(id).populate('lists').exec(function(err, list) {

            if(err || !list) {
                return res.render('error', {
                    message: '出错了'
                });
            }
            var condition = {};
            List.find(condition, function(err, results) {
                obj.list = results;
                _.extend(list, obj);
                console.info(list);
                editHandler(list);
            });
        });
    }
};

//删除
exports.del = function(req, res) {
    var deleteHandle = function(list) {
        list.remove(function(err) {
            if(err) {
                return res.render('error', {
                    message: '删除失败'
                });
            }
            res.render('error', {
                message: '删除成功'
            })
        });
    };
    var id = req.params.id;
    List.findById(id).populate('lists').exec(function(err, result) {
        if(!result) {
            return res.render('error', {
                message: '数据不存在'
            });
        }
        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                });
            }
            if(err) {
                return res.render('error', {
                    message: '删除失败'
                });
            }
            var path = core.translateAdminDir('');
            return res.redirect(path);
        });
    });
}

//添加
exports.add = function(req, res) {
    var method = req.method;
    if (method === 'GET') {
        res.render('add', {
            title: 'add'
        });
    } else if (method === 'POST') {
        var obj = req.body;
        console.log(obj);
        var list = new List(obj);
        list.save(function(err, result) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                console.log(err);
                return res.render('error', {
                    message: '添加失败'
                });
            }
            /*res.render('error', {
                message: '添加成功'
            });*/
            var path = core.translateAdminDir('/');
            res.redirect(path);
        });
    }
};

//单个
exports.one = function(req, res) {
    var id = req.param('id');
    List.findById(id).populate('lists').exec(function(err, result) {
        res.render('one', {
            title: 'detail',
            list: result
        });
    });
};

//Ajax添加
exports.addAjax = function(req, res) {
    var method = req.method;
    if (method === 'GET') {
        res.render('addAjax', {
            title: 'addAjax'
        });
    } else if (method === 'POST') {
        var obj = req.body;
        console.info(obj);
        var list = new List(obj);
        list.save(function(err, result) {
            //ajax请求，req.xhr为true xhr是xml http请求的简称，ajax依赖于xhr
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                return res.render('error', {
                    message: '添加失败'
                });
            }
        });
    }
};

//展示listAjax页面
exports.listPage = function(req, res,next) {
    res.render('listAjax', { //views中listAjax.ejs
        title: 'listPage'
    });
}
//listAjax查询列表数据
exports.listAjax = function(req, res,next) {
    var condition = {};
    List.count(condition, function(err, total) {
        var query = List.find(condition).populate('lists');
        //分页
        var pageInfo = core.createPage(req, total, 5);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        console.info(pageInfo);
        query.exec(function(err, results) {
            if(err){
                return next(err);
            }
            else{
                res.send(JSON.stringify(results));
            }
        });
    });
}