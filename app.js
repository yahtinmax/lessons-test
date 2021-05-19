const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const router = require("./routers");

app.use(bodyParser.json());

app.use("/", router.lessons);

app.use((error, req, res, next) => {
  res.status(error.output ? error.output.statusCode || 500 : 500).json({
    error: error.output
      ? error.output.payload.message
      : "Internal server error",
    data: null,
  });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ error: "404. Sorry we cant find this route. Try again" });
});

module.exports = app;
