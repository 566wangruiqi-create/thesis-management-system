const pool = require("../config/db");

// 用户管理接口：管理员查看教师和学生基础信息，暂不做新增修改，方便课程演示。
async function getUsers(req, res, next) {
  try {
    const [teachers] = await pool.query(
      "SELECT id, name, college, title, phone, email FROM teachers ORDER BY id"
    );
    const [students] = await pool.query(
      "SELECT id, name, class_name, major, phone, email FROM students ORDER BY id"
    );

    res.json({
      success: true,
      message: "获取用户列表成功",
      data: {
        teachers,
        students
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers
};
