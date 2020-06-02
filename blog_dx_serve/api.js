const register = require("./api/register");
const login = require("./api/login");
const article = require("./api/article");
const img = require("./api/img");
const qiniu = require("./api/qiniu");
const redis = require("./database/redis");
const response = require("./utils/response");
const CODE = require("./resCode");

const api = "/api";
module.exports = function(app) {
  app.use(api, register);
  app.use(api, login);
  app.use(api, function(req, res, next) {
    redis.getkey("token").then(token => {
      if (token !== null && req.headers.token === token) {
        next();
      } else {
        res.send(response.out(CODE.ERROR_TOKEN, {}, "没有登录"));
      }
    });
  });
  app.use(api, article);
  app.use(api, img);
  app.use(api, qiniu);
};
