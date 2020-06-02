module.exports = {
  succ: function(resData = {}, resMsg = "") {
    return {
      resCode: 0,
      resData,
      resMsg
    };
  },
  err: function(resCode, resData = {}, resMsg = "") {
    return {
      resCode,
      resData,
      resMsg
    };
  },
  out: function(resCode, resData = {}, resMsg = "") {
    return {
      resCode,
      resData,
      resMsg
    };
  }
};
