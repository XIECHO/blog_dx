const path = require("path");

module.exports = {
  TOKEN_EXPIRE: 60,
  JWT_SECRET: "jjjjjj",
  MD5_SECRET: "jkkks934(EIURLOE(W)WF<{fs;f{{",
  MONGO_LINK: "mongodb://127.0.0.1:27017/tokentest",
  REDIS_LINK: "127.0.0.1",
  ACCESSKEY: "BFMhA8txrCAZVykhkopFHnbMUOY0fsMz0wEDFw3v",
  SECRETKEY: "_EezN4lUNF06hNMACx2XXMsE6aVOvyYei9DNHKfd",
  BUCKET: "blogdx",
  GITHUB_CLIENT_ID: "d210070a995bece153d1",
  GITHUB_CLIENT_SECRET: "699545a4a9a2abbb757ac80bea4518814b78fd6c",
  swaggerConfig: {
    openapi: "3.0.0",
    title: "Blog API",
    version: "0.0.1",
    description: "## Blog页面和Blog admin页面的api",
    url: "http://localhost:3000",
    apis: [
      path.join(__dirname, "/utils/response.js"),
      path.join(__dirname, "/api/*.js")
    ],
    routerPath: "/api-docs"
  }
};
