const express = require("express");
const User = require("../model/user");
const response = require("../utils/response");
const common = require("../utils/common");
const router = express.Router();
const redis = require("../database/redis");
const config = require("../config");
const CODE = require("../resCode");

/**
 * @swagger
 * /api/login:
 *  post:
 *    tags:
 *       - admin页面
 *    summary: 登录
 *    description: 登录并返回token
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *              password:
 *                type: string
 *            required:
 *              - username
 *              - password
 *    responses:
 *      '200':
 *        description: A list of Person
 *        schema:
 *          type: array
 *          items:
 *            properties:
 *              firstName:
 *                type: string
 *              lastName:
 *                type: string
 *              username:
 *                type: string
 */
router.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  //是否合法的参数
  if (username == null || password == null) {
    res.send(
      response.out(
        CODE.ERROR_USERNAME_PASSWORD_NULL,
        {},
        "用户名或密码不能为空"
      )
    );
    return;
  }

  User.findOne({ username: username, password: common.md5(password) })
    .then(data => {
      return new Promise((resolve, reject) => {
        if (data) {
          resolve(data);
        } else {
          res.send(
            response.out(CODE.ERROR_USERNAME_PASSWORD, {}, "用户名或密码错误")
          );
          reject();
        }
      });
    })
    .then(data => {
      const token = common.signtoken(JSON.stringify(data));
      redis.setkv("type", data.type, config.TOKEN_EXPIRE);
      redis.setkv("token", token, config.TOKEN_EXPIRE).then(() => {
        console.log("验证码保存redis成功" + config.TOKEN_EXPIRE + "秒后超时");
      });
      res.send(
        response.succ({ token: token, username: username }, "用户登录成功")
      );
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
});

/**
 * @swagger
 * /api/logout:
 *  post:
 *    tags:
 *       - admin页面
 *    summary: 登出
 *    description: 登出并删除token
 *    responses:
 *      '200':
 *        description: A list of Person
 */
router.post("/logout", function(req, res) {
  redis.delkey("token").then(() => {
    console.log("删除成功");
  });
  redis.delkey("type").then(() => {
    console.log("删除成功");
  });
  res.send(response.succ({}, "登出"));
});

router.get("/ni", function(req, res) {
  redis.getkey("token").then(token => {
    if (req.headers.token == token) {
      res.send(req.headers);
    } else {
      res.send(response.out(CODE.ERROR_TOKEN, {}, "没有登录"));
    }
  });
});

module.exports = router;
