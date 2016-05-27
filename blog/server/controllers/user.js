'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role'),
    _ = require('underscore'),
    core = require('../config/core');

//注册
exports.register = function(req, res) {
    var method = req.method;
    if (method === 'GET') {
        res.render('register', {title: '注册'});
    } else if (method === 'POST') {
        var obj = req.body;
        console.log(obj);
        var users = new User(obj);

        User.findOne({
            name: obj.name
        }).populate('users').exec(function(err, user) {
            if (user) {
                return res.render('error', {
                    message: '注册失败, 该用户已存在',
                    title: '错误'
                });
            }
            users.save(function(err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                    var errors = err.errors;
                    var message = [];
                    for (var i in errors) {
                        message.push(errors[i].message);
                    }
                    return res.render('error', {
                        message: '注册失败' + message.join('<br/>'),
                        title: '注册'
                    });
                }
                /* res.render('', {
                 message: '注册成功',
                 title: '注册',
                 result: result
                 });*/
                var path = core.translateAdminDir('/');
                res.redirect(path);
            });
        });


    }
};

var noRedirect = [
    'user/login',
    'user/forget',
    'user/register'
];
//登录
exports.login = function(req, res) {
    if (req.method === 'GET') {
        //req.session.loginReferer = req.headers.referer;
        res.render('login', {title: '登录'});
    } else if (req.method === 'POST') {
        var username = req.body.name;
        var password = req.body.password;
        User.findOne({
            name: username
        }).populate('users').exec(function(err, user) {
            if (!user) {
                return res.render('error', {
                    message: '登录失败, 查无此人',
                    title: '错误'
                });
            }
           // if (user.authenticate(password)) {
                console.log('登录成功---');

                //记录登录信息
                user.last_login_date = new Date();
                user.last_login_ip = core.getIp(req);
                user.save();
                req.session.user = user;
                console.log(req.session.user);
                var path = core.translateAdminDir('/');

                var ref = req.session.loginReferer || path;
                for (var i =0, len = noRedirect.length; i < len; i ++) {
                    if (ref.indexOf(noRedirect[i]) > -1) {
                        ref = path;
                        break;
                    }
                }
                console.info(ref);
                res.redirect(ref);
                /*res.render('', {
                    message: '登录成功',
                    title: '登录',
                    result: user
                });*/
            /*} else {
                res.render('error', {
                    message: '密码不正确',
                    title: '注册'
                });
            }*/
        });
    }

};

//退出登录
exports.loginout = function(req, res) {
    req.session.user = null;
    var path = core.translateAdminDir('/');
    res.redirect(path);

};