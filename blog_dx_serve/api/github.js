const express = require("express");
const axios = require("axios");
const response = require("../utils/response");
const router = express.Router();
const config = require("../config");

/**
 * @swagger
 * /blogapi/github:
 *   get:
 *     tags:
 *       - blog页面
 *     summary: github第三方授权登录
 *     description: github第三方授权登录
 *     parameters:
 *       - name: code
 *         in: query
 *         description: 码
 *         type: string 
 *     responses:
 *       '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
router.get("/github", function(req, resp) {
  const requestToken = req.query.code;
  axios({
    method: "post",
    url:
      "https://github.com/login/oauth/access_token?" +
      `client_id=${config.GITHUB_CLIENT_ID}&` +
      `client_secret=${config.GITHUB_CLIENT_SECRET}&` +
      `code=${requestToken}`,
    headers: {
      accept: "application/json"
    }
  }).then(res => {
    const accessToken = res.data.access_token;
    axios({
      method: "get",
      url: `https://api.github.com/user`,
      headers: {
        accept: "application/json",
        Authorization: `token ${accessToken}`
      }
    })
      .then(res => {
        resp.send(response.succ({ info: res.data }, "用户登录成功"));
      })
      .catch(err => {
        //resp.send(response.succ(err, "用户登录成功"));
        resp.send("hello");
      });
  });
});

module.exports = router;
