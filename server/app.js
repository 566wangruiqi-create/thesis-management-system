const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const topicRoutes = require("./routes/topicRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const materialRoutes = require("./routes/materialRoutes");
const defenseRoutes = require("./routes/defenseRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const archiveRoutes = require("./routes/archiveRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "毕业论文管理系统后端服务运行正常"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/defenses", defenseRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/archives", archiveRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "接口不存在"
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "服务器内部错误"
  });
});

app.listen(PORT, () => {
  console.log(`毕业论文管理系统后端服务已启动：http://localhost:${PORT}`);
});

module.exports = app;
