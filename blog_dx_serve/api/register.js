const express = require("express");
const User = require("../model/user");
const response = require("../utils/response");
const common = require("../utils/common");
const router = express.Router();
const CODE = require("../resCode");

router.post("/register", (req, res) => {
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

  //是否存在用户
  User.findOne({ username: username })
    .then(data => {
      console.log(data);
      return new Promise((resolve, reject) => {
        if (data) {
          res.send(response.out(CODE.ERROR_REGISTER_EXIST, {}, "用户已注册过"));
          reject();
        } else {
          resolve();
        }
      });
    })
    .then(() => {
      //存储
      return new User({
        username: username,
        password: common.md5(password),
        type: "admin"
      }).save();
    })
    .then(data => {
      console.log(data);
      if (data) {
        //返回
        res.send(response.succ({}, "注册成功"));
        return;
      }
      //返回
      res.send(response.out(CODE.ERROR_REGISTER, {}, "注册失败"));
    })
    .catch(err => {
      //异常
      if (err) {
        console.log(err);
      }
    });
});

module.exports = router;
