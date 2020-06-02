const mongoose = require("mongoose");

const Article = mongoose.model(
  "Article",
  new mongoose.Schema({
    title: String,
    date: Number,
    lastDate: Number,
    tags: Array,
    readCount: Number,
    commentCount: {
      type: Number,
      default: 0
    },
    abstract: String,
    content: String,
    mdContent: String,
    type: Number,
    catalog: [
      {
        lev: Number,
        text: String,
        id: String
      }
    ]
  })
);

module.exports = Article;
