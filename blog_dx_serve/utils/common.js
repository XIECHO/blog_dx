const config = require("../config");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

const signtoken = function(obj) {
  return jwt.sign(obj, config.JWT_SECRET);
};

const verifytoken = function(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_SECRET, function(err, decoded) {
      if (err) {
        resolve(null);
      } else {
        resolve(decoded);
      }
    });
  });
};

const cmd5 = function(str) {
  return md5(str + config.MD5_SECRET);
};

module.exports = {
  signtoken,
  verifytoken,
  md5: cmd5
};
