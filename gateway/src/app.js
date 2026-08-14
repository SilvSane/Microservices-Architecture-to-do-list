require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:8080"
).split(",");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gateway",
  });
});

app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    changeOrigin: true,
  }),
);

app.use(
  "/tasks",
  createProxyMiddleware({
    target: process.env.TASK_SERVICE_URL || "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: (path) => `/tasks${path}`,
  }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App started at http://localhost:${PORT}/`);
});
