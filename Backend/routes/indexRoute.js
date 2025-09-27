const express = require("express");

const indexRoute = express.Router();

indexRoute.use("/user", require("./authRoutes"));
indexRoute.use("/chat", require("./chatRoutes"));
indexRoute.use("/story", require("./PdfStoryRoute"));
indexRoute.use("/comic", require("./generateComicRoute"));
indexRoute.use("/panel", require("./panelRoute"));
indexRoute.use("/sam", require("./SamRoute"));

module.exports = indexRoute;