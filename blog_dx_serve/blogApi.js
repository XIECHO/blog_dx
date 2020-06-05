const article = require("./api/article");
const comment = require("./api/comment");
const github = require("./api/github");

const api = "/blogapi";
module.exports = function(app) {
  app.use(api, article);
  app.use(api, comment);
  app.use(api, github);
};
