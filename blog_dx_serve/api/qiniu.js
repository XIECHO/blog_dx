const qiniu = require("qiniu");
const express = require("express");
const response = require("../utils/response");
const router = express.Router();
const CODE = require("../resCode");
const config = require("../config");
const redis = require("../database/redis");

// 验证权限
function check(res, next) {
  redis.getkey("type").then(type => {
    if (type !== null && type == "admin") {
      next();
    } else {
      res.send(response.out(CODE.ERROR_AUTH, {}, "没有操作权限"));
    }
  });
}

/**
 * @swagger
 * /api/qiniuToken:
 *   get:
 *     tags:
 *       - admin页面
 *     summary: 获得七牛的token
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/qiniuToken", function(req, res) {
  check(res, () => {
    // 七牛账号下的一对有效的Access Key和Secret Key
    // 对象存储空间名称 bucket
    let accessKey = config.ACCESSKEY,
      secretKey = config.SECRETKEY,
      bucket = config.BUCKET;

    //鉴权对象
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    let options = {
      scope: bucket,
      expires: 60 * 60 * 24 * 7 //这里设置的7天,token过期时间(s(秒))
    };

    let putPolicy = new qiniu.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(mac);

    res.send(response.succ({ qiniuToken: uploadToken }, "获得七牛token成功"));
  });
});

module.exports = router;
