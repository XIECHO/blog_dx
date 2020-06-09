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
 *       - name: params
 *         in: query
 *         description: 第几页以及每页一共几遍文章
 *         type: object
 *           
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
 */
/**
 * @swagger
 * /blogapi/article/list:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: GET 测试
 *     description: 用于测试基础 GET 请求的接口
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
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
 *       200:
 *         description: 是否获取成功的响应提示
 *         schema:
 *           properties:
 *             resCode:
 *               type: integer
 *             resData:
 *               type: object
 *             resMsg:
 *               type: string
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
 * /api/article/prev:
 *   get:
 *     tags:
 *       - admin页面
 *     summary: GET 测试
 *     description: 用于测试基础 GET 请求的接口
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
 */
/**
 * @swagger
 * /blogapi/article/prev:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: GET 测试
 *     description: 用于测试基础 GET 请求的接口
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
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
 * /api/article/next:
 *   get:
 *     tags:
 *       - admin页面
 *     summary: GET 测试
 *     description: 用于测试基础 GET 请求的接口
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
 */
/**
 * @swagger
 * /blogapi/article/next:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: GET 测试
 *     description: 用于测试基础 GET 请求的接口
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
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
 *     summary: GET 测试
 *     description: 用于测试基础 GET 请求的接口
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
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
 *     parameters:
 *       - name: data
 *         in: body
 *         description: 文章数据.
 *         schema:
 *           articleData:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: number
 *               lastDate:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               readCount:
 *                 type: number
 *               abstract:
 *                 type: string
 *               content:
 *                 type: string
 *               mdContent:
 *                 type: string
 *               type:
 *                 type: number
 *               catalog:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     lev:
 *                       type: number
 *                     text:
 *                       type: string    
 *     responses:
 *       200:
 *         description: 是否保存成功的响应提示
 *         schema:
 *           properties:
 *             resCode:
 *               type: integer
 *             resData:
 *               type: object
 *             resMsg:
 *               type: string
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
 *     summary: 修改文章
 *     description: 用于测试基础 GET 请求的接口
 *     parameters:
 *       - name: data
 *         in: body
 *         description: 文章数据.
 *         schema:
 *           required:
 *             - _id
 *             - newData
 *           _id:
 *             type: string
 *           newData:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               lastDate:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               abstract:
 *                 type: string
 *               content:
 *                 type: string
 *               mdContent:
 *                 type: string
 *               catalog:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     lev:
 *                       type: number
 *                     text:
 *                       type: string    
 *     responses:
 *       200:
 *         description: 是否修改成功的响应提示
 *         schema:
 *           properties:
 *             resCode:
 *               type: integer
 *             resData:
 *               type: object
 *             resMsg:
 *               type: string
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
 *   get:
 *     tags:
 *       - admin页面
 *     summary: GET 测试
 *     description: 用于测试基础 GET 请求的接口
 *     responses:
 *       200:
 *         description: 【成功】 返回 world
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
