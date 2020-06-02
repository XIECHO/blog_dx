const express = require("express");
const api = require("./api");
const app = express();
const port = 3000;
require("./database/mongoconn");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

api(app);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
