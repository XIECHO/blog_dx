const redis = require("redis");
const config = require("../config");
const client = redis.createClient(6379, config.redislink);

const setkv = function(key, value, expire) {
  return new Promise(resolve => {
    client.set(key, value, "EX", expire, function(err, reply) {
      if (err) {
        resolve(null);
      } else {
        resolve(reply);
      }
    });
  });
};

const getkey = function(key) {
  return new Promise(resolve => {
    client.get(key, function(err, reply) {
      if (err) {
        resolve(null);
      } else {
        resolve(reply);
      }
    });
  });
};

const delkey = function(key) {
  return new Promise(resolve => {
    client.del(key, function(err, reply) {
      if (err) {
        resolve(null);
      } else {
        resolve(reply);
      }
    });
  });
};

module.exports = {
  setkv,
  getkey,
  delkey
};
