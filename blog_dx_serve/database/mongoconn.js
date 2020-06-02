const mongoose = require("mongoose");
const config = require("../config");

mongoose.connect(
  config.MONGO_LINK,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err) {
    if (err) {
      console.log("Connection Error:" + err);
    } else {
      console.log("Connection success!");
    }
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "数据库connection error:"));
