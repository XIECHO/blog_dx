const express = require("express");
const router = express.Router();
const Article = require("../model/article");
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
 * /api/article/list:
 *   get:
 *     tags:
 *       - admin页面
 *     summary: 获取对应页面的文章
 *     description: 获取对应页面的文章
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 第几页
 *         schema:
 *           type: string
 *       - name: pageSize
 *         in: query
 *         description: 每页一共几遍文章
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
/**
 * @swagger
 * /blogapi/article/list:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: 获取对应页面的文章
 *     description: 获取对应页面的文章
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 第几页
 *         schema:
 *           type: string
 *       - name: pageSize
 *         in: query
 *         description: 每页一共几遍文章
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/article/list", function(req, res) {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let skip = (page - 1) * pageSize;

  redis
    .getkey("type")
    .then(type => {
      let params = {};
      if (type != "admin") {
        params = { type: 0 };
      }
      return Promise.resolve(params);
    })
    .then(params => {
      Article.countDocuments(params, function(err, total) {
        if (err) {
          res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
        } else {
          let articleModel = Article.find(params, {
            title: true,
            tags: true,
            date: true,
            lastDate: true,
            abstract: true,
            readCount: true,
            commentCount: true,
            type: true
          })
            .sort({ date: -1 })
            .skip(skip)
            .limit(pageSize);
          articleModel.exec(function(err, docs) {
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
});

/**
 * @swagger
 * /blogapi/article/single:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: 获取单篇文章
 *     parameters:
 *       - name: articleId
 *         in: query
 *         description: 文件的_id
 *         type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
/**
 * @swagger
 * /api/article/single:
 *   get:
 *     tags:
 *       - admin页面
 *     summary: 获取单篇文章
 *     parameters:
 *       - name: articleId
 *         in: query
 *         description: 文件的_id
 *         type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/article/single", function(req, res) {
  Article.update({ _id: req.query._id }, { $inc: { readCount: 1 } }, function(
    err
  ) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      Article.find({ _id: req.query._id }, function(err, doc) {
        if (err) {
          res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
        } else {
          res.send(response.succ(doc, ""));
        }
      });
    }
  });
});

/**
 * @swagger
 * /blogapi/article/prev:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: 获得上一篇文章
 *     description: 根据最后修改的时间排序，获得上一篇文章
 *     parameters:
 *       - name: date
 *         in: query
 *         description: 文件修改的时间
 *         type: number
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/article/prev", function(req, res) {
  let prev = Article.find(
    { date: { $lt: req.query.date }, type: { $ne: 1 } },
    {
      title: true,
      _id: true
    }
  )
    .sort({ date: -1 })
    .limit(1);

  prev.exec(function(err, doc) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      res.send(response.succ(doc, ""));
    }
  });
});

/**
 * @swagger
 * /blogapi/article/next:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: 获得下一篇文章
 *     description: 根据最后修改的时间排序，获得下一篇文章
 *     parameters:
 *       - name: date
 *         in: query
 *         description: 文件修改的时间
 *         type: number
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/article/next", function(req, res) {
  let next = Article.find(
    { date: { $gt: req.query.date }, type: { $ne: 1 } },
    { title: true, _id: true }
  ).limit(1);

  next.exec(function(err, doc) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      res.send(response.succ(doc, ""));
    }
  });
});

/**
 * @swagger
 * /blogapi/article/tag:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: 获得所有标签为tag的文章
 *     description: 根据tag标签，返回所有含有tag标签的文章
 *     parameters:
 *       - name: tag
 *         in: query
 *         description: 文章标签
 *         type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/article/tag", function(req, res) {
  let tagModel = Article.find(
    { tags: req.query.tag, type: { $ne: 1 } },
    { title: true, date: true }
  ).sort({ date: -1 });

  tagModel.exec(function(err, doc) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      res.send(response.succ({ list: doc }, ""));
    }
  });
});

/**
 * @swagger
 * /api/article/save:
 *   post:
 *     tags:
 *       - admin页面
 *     summary: 保存文章
 *     description: 保存文章
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               articleData:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   date:
 *                     type: number
 *                   lastDate:
 *                     type: number
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   readCount:
 *                     type: number
 *                   abstract:
 *                     type: string
 *                   content:
 *                     type: string
 *                   mdContent:
 *                     type: string
 *                   type:
 *                     type: number
 *                   catalog:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         lev:
 *                           type: number
 *                         text:
 *                           type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.post("/article/save", function(req, res) {
  check(res, () => {
    new Article(req.body).save(function(err) {
      if (err) {
        res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
      } else {
        res.send(response.succ({}, "发布成功！"));
      }
    });
  });
});

/**
 * @swagger
 * /api/article/change:
 *   post:
 *     tags:
 *       - admin页面
 *     summary: 修改文章内容或者修改文章的状态（公开或者是隐私）
 *     description: 修改文章内容或者修改文章的状态（公开或者是隐私）
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               newData:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   lastDate:
 *                     type: number
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   abstract:
 *                     type: string
 *                   content:
 *                     type: string
 *                   mdContent:
 *                     type: string
 *                   type:
 *                     type: number
 *                   catalog:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         lev:
 *                           type: number
 *                         text:
 *                           type: string
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.post("/article/change", function(req, res) {
  check(res, () => {
    let _id = req.body._id;
    let newData = req.body.newData;

    Article.update({ _id: _id }, { $set: newData }, function(err) {
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
 * /api/article/remove:
 *   post:
 *     tags:
 *       - admin页面
 *     summary: 删除文章
 *     description: 根据_id删除文章
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.post("/article/remove", function(req, res) {
  check(res, () => {
    let _id = req.body._id;
    Article.remove({ _id: _id }, function(err) {
      if (err) {
        res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
      } else {
        res.send(response.succ());
      }
    });
  });
});

module.exports = router;
