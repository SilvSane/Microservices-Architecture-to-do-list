const express = require("express");
const path = require("path");

const IS_TEST = process.env.IS_TEST || false;

const app = express();
if (!IS_TEST) app.use(express.static(path.join(__dirname, "public")));
else app.use(express.static(path.join(__dirname, "test")));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Frontend listen to http://localhost:${PORT}/`),
);
