const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
// app.disable("etag");

app.get("/", (req, res) => {
  res.json({
    message: "🌎🌍🌏 Furnitures ",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
