const express = require("express");
const router = express.Router();
const Img = require("../model/img");
const response = require("../utils/response");
const redis = require("../database/redis");
const CODE = require("../resCode");

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
 * /api/img/save:
 *   post:
 *     tags:
 *       - admin页面
 *     summary: 保存图片 
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.post("/img/save", function(req, res) {
  check(res, () => {
    new Img(req.body).save(function(err) {
      if (err) {
        res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
      } else {
        res.send(response.succ());
      }
    });
  });
});

/**
 * @swagger
 * /api/img/list:
 *   get:
 *     tags:
 *       - admin页面
 *     summary: 获得所有的图片
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         type: string
 *       - name: pageSize
 *         in: query
 *         description: 页面大小
 *         type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/img/list", function(req, res) {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let skip = (page - 1) * pageSize;

  Img.countDocuments({}, function(err, total) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      let imgModel = Img.find(
        {},
        {
          delete: true,
          url: true,
          filename: true
        }
      )
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize);

      imgModel.exec(function(err, docs) {
        if (err) {
          res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
        } else {
          res.send(
            response.succ({ total, count: docs.length, list: docs }, "")
          );
        }
      });
    }
  });
});

/**
 * @swagger
 * /api/img/remove:
 *   post:
 *     tags:
 *       - admin页面
 *     summary: 删除图片
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.post("/img/remove", function(req, res) {
  check(res, () => {
    let _id = req.body._id;
    Img.remove({ _id: _id }, function(err) {
      if (err) {
        res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
      } else {
        res.send(response.succ());
      }
    });
  });
});

module.exports = router;
