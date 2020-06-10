/**
 * @swagger
 * components:
 *   schemas:
 *     Response:
 *       properties:
 *         resCode:
 *           type: integer
 *         resData:
 *           type: string
 *         resMsg:
 *           type: string
 *       # Both properties are required
 *       required:
 *         - resCode
 *         - resData
 *         - resMsg
 */
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
