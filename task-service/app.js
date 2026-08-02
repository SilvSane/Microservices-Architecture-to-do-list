require("dotenv").config();

const express = require("express");
const taskRoutes = require("./src/routes/task.routes");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "task-service" });
});

app.use("/tasks", taskRoutes);

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
