const express = require("express");
const api = require("./api");
const blogApi = require("./blogApi");
const app = express();
const port = 3000;
require("./database/mongoconn");

const setSwagger = require("./swagger");
setSwagger(app);

app.use("/static", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

api(app);
blogApi(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
