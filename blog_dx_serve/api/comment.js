const express = require("express");
const router = express.Router();
const Comment = require("../model/comment");
const Article = require("../model/article");

// 保存一级评论
router.post("/comment/save_comment", function(req, res) {
  new Comment(req.body).save(function(err) {
    if (err) {
      res.status(500).send();
      return;
    }
    res.send({
      status: "0"
    });
    // 更新对应文章评论数
    let _id = req.body.article_id;
    Article.update({ _id: _id }, { $inc: { commentCount: 1 } }, function(
      err,
      doc
    ) {
      if (err) {
        console.log(err);
      }
    });
  });
});

// 保存二级评论
router.post("/comment/save_follow_comment", function(req, res) {
  Comment.update(
    { _id: req.body.follow_id },
    { $push: { comment_follow: req.body } },
    function(err, doc) {
      if (err) {
        res.json({
          status: "1",
          msg: err.message
        });
      } else {
        res.json({
          status: "0"
        });
        // 找到对应文章 _id
        Comment.findOne({ _id: req.body.follow_id }, function(err, doc) {
          if (err) {
            console.log(err);
            return;
          }
          let _id = doc.article_id;
          // 更新评论数
          Article.update({ _id: _id }, { $inc: { commentCount: 1 } }, function(
            err,
            doc
          ) {
            if (err) {
              console.log(err);
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
      console.log(err);
      return;
    }
    let totalComment = doc.comment_follow.length + 1;
    let article_id = doc.article_id;
    // 删除评论
    Comment.remove({ _id: _id }, function(err) {
      if (err) {
        res.json({
          status: "1",
          msg: err.message,
          result: ""
        });
      } else {
        res.json({
          status: "0"
        });
        // 更新评论数
        Article.update(
          { _id: article_id },
          { $inc: { commentCount: -totalComment } },
          function(err, doc) {
            if (err) {
              console.log(err);
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
        res.json({
          status: "1",
          msg: err.message,
          result: ""
        });
      } else {
        res.json({
          status: "0"
        });
        // 找到对应文章 _id
        Comment.findOne({ _id: top_id }, function(err, doc) {
          if (err) {
            console.log(err);
            return;
          }
          let _id = doc.article_id;
          // 更新评论数
          Article.update({ _id: _id }, { $inc: { commentCount: -2 } }, function(
            err,
            doc
          ) {
            if (err) {
              console.log(err);
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

  comment.exec(function(err, doc) {
    if (err) {
      res.json({
        status: "1",
        msg: err
      });
      return;
    }
    res.json({
      status: "0",
      result: doc
    });
  });
});

module.exports = router;
