require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth.routes");
const app = express();

const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.use("/", authRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || "INTERNAL ERROR",
      message: err.message || "Internal error!",
    },
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}/`);
});
