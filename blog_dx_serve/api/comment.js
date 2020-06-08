const express = require("express");
const router = express.Router();
const Comment = require("../model/comment");
const Article = require("../model/article");
const response = require("../utils/response");

// 保存一级评论
router.post("/comment/save_comment", function(req, res) {
  new Comment(req.body).save(function(err) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      // 更新对应文章评论数
      let _id = req.body.article_id;
      Article.update({ _id: _id }, { $inc: { commentCount: 1 } }, function(
        err
      ) {
        if (err) {
          res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
        } else {
          res.send(response.succ({}, "评论保存成功！"));
        }
      });
    }
  });
});

// 保存二级评论
router.post("/comment/save_follow_comment", function(req, res) {
  Comment.update(
    { _id: req.body.follow_id },
    { $push: { comment_follow: req.body } },
    function(err) {
      if (err) {
        res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
      } else {
        // 找到对应文章 _id
        Comment.findOne({ _id: req.body.follow_id }, function(err, doc) {
          if (err) {
            res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
          }
          let _id = doc.article_id;
          // 更新评论数
          Article.update({ _id: _id }, { $inc: { commentCount: 1 } }, function(
            err
          ) {
            if (err) {
              res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
            } else {
              res.send(response.succ({}, "二级评论保存成功！"));
            }
          });
        });
      }
    }
  );
});

// 删除一级评论
router.post("/comment/remove_comment", function(req, res) {
  let _id = req.body._id;

  // 找到评论
  Comment.findOne({ _id: _id }, function(err, doc) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    }
    let totalComment = doc.comment_follow.length + 1;
    let article_id = doc.article_id;
    // 删除评论
    Comment.remove({ _id: _id }, function(err) {
      if (err) {
        res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
      } else {
        // 更新评论数
        Article.update(
          { _id: article_id },
          { $inc: { commentCount: -totalComment } },
          function(err) {
            if (err) {
              res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
            } else {
              res.send(response.succ());
            }
          }
        );
      }
    });
  });
});

// 删除二级评论
router.post("/comment/remove_follow_comment", function(req, res) {
  let _id = req.body._id;
  let top_id = req.body.top_id;

  Comment.update(
    { _id: top_id },
    { $pull: { comment_follow: { _id: _id } } },
    function(err) {
      if (err) {
        res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
      } else {
        // 找到对应文章 _id
        Comment.findOne({ _id: top_id }, function(err, doc) {
          if (err) {
            res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
          }
          let _id = doc.article_id;
          // 更新评论数
          Article.update({ _id: _id }, { $inc: { commentCount: -2 } }, function(
            err
          ) {
            if (err) {
              res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
            } else {
              res.send(response.succ());
            }
          });
        });
      }
    }
  );
});

// 获取单篇文章评论数据
router.get("/comment/get_comments", function(req, res) {
  let comment = Comment.find({ article_id: req.query.article_id });

  comment.exec(function(err, docs) {
    if (err) {
      res.send(response.err(CODE.ERROR_DATABASE, err, err.message));
    } else {
      res.send(response.succ({ list: docs }, ""));
    }
  });
});

module.exports = router;
