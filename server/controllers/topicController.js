const pool = require("../config/db");
const generateId = require("../utils/idGenerator");

// 查询课题：所有已登录用户可访问，通过 JOIN 补充教师姓名，供前端展示使用。
async function getTopics(req, res, next) {
  try {
    const [topics] = await pool.query(`
      SELECT
        t.id,
        t.title,
        t.teacher_id,
        te.name AS teacher_name,
        t.major,
        t.quota,
        t.selected_count,
        t.status,
        t.description,
        t.created_at,
        t.updated_at
      FROM topics t
      JOIN teachers te ON te.id = t.teacher_id
      ORDER BY t.id
    `);

    res.json({
      success: true,
      message: "获取课题列表成功",
      data: topics
    });
  } catch (error) {
    next(error);
  }
}

// 发布课题：教师默认发布自己的课题，管理员可以通过 teacher_id 指定教师。
async function createTopic(req, res, next) {
  try {
    const { title, major, quota, description } = req.body;
    const teacherId = req.user.role === "teacher" ? req.user.teacher_id : req.body.teacher_id;

    if (!title || !major || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "课题名称、专业和教师编号不能为空"
      });
    }

    const [teachers] = await pool.query("SELECT id FROM teachers WHERE id = ?", [teacherId]);
    if (!teachers[0]) {
      return res.status(404).json({
        success: false,
        message: "教师不存在"
      });
    }

    const id = await generateId("topics", "TP");
    await pool.query(
      `INSERT INTO topics (id, title, teacher_id, major, quota, selected_count, status, description)
       VALUES (?, ?, ?, ?, ?, 0, '可选', ?)`,
      [id, title, teacherId, major, Number(quota) || 1, description || null]
    );

    const [rows] = await pool.query("SELECT * FROM topics WHERE id = ?", [id]);
    res.status(201).json({
      success: true,
      message: "发布课题成功",
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTopics,
  createTopic
};
