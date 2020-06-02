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

/* 获取文章列表 */
router.get("/article/list", function(req, res) {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let skip = (page - 1) * pageSize;

  Article.countDocuments({}, function(err, total) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      let articleModel = Article.find(
        {},
        {
          title: true,
          tags: true,
          date: true,
          lastDate: true,
          abstract: true,
          readCount: true,
          commentCount: true,
          type: true
        }
      )
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

// 获取单篇文章
router.get("/article/single", function(req, res) {
  console.log(req.query._id);
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

// 获取上一篇
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

// 获取下一篇
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

// 获取标签所有文章
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

// 添加文章
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

// 修改文章
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

// 删除文章
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
