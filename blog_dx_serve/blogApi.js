const article = require("./api/article");
const comment = require("./api/comment");

const api = "/blogapi";
module.exports = function(app) {
  app.use(api, article);
  app.use(api, comment);
};
