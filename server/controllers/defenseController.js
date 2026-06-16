const pool = require("../config/db");
const generateId = require("../utils/idGenerator");

// 查询答辩安排：学生看自己，教师看相关学生，管理员看全部。
async function getDefenses(req, res, next) {
  try {
    const params = [];
    let where = "";

    if (req.user.role === "student") {
      where = "WHERE d.student_id = ?";
      params.push(req.user.student_id);
    } else if (req.user.role === "teacher") {
      where = "WHERE d.teacher_id = ?";
      params.push(req.user.teacher_id);
    }

    const [defenses] = await pool.query(
      `
        SELECT
          d.id,
          d.student_id,
          s.name AS student_name,
          d.topic_id,
          t.title AS topic_title,
          d.teacher_id,
          te.name AS teacher_name,
          d.defense_time,
          d.place,
          d.defense_group,
          d.chair,
          d.status,
          d.created_at,
          d.updated_at
        FROM defense_arrangements d
        JOIN students s ON s.id = d.student_id
        JOIN topics t ON t.id = d.topic_id
        JOIN teachers te ON te.id = d.teacher_id
        ${where}
        ORDER BY d.defense_time, d.id
      `,
      params
    );

    res.json({
      success: true,
      message: "获取答辩安排成功",
      data: defenses
    });
  } catch (error) {
    next(error);
  }
}

// 管理员安排答辩：根据学生已通过的选题自动确定课题和指导教师。
async function createDefense(req, res, next) {
  try {
    const studentId = req.body.student_id || req.body.studentId;
    const defenseTime = req.body.defense_time || req.body.time;
    const defenseGroup = req.body.defense_group || req.body.group;

    if (!studentId || !defenseTime || !req.body.place || !defenseGroup || !req.body.chair) {
      return res.status(400).json({
        success: false,
        message: "学生、时间、地点、小组和组长不能为空"
      });
    }

    const [applications] = await pool.query(
      "SELECT * FROM topic_applications WHERE student_id = ? AND status = '已通过' ORDER BY review_date DESC LIMIT 1",
      [studentId]
    );
    const application = applications[0];

    if (!application) {
      return res.status(400).json({
        success: false,
        message: "该学生尚无已通过的选题"
      });
    }

    const id = await generateId("defense_arrangements", "D");
    await pool.query(
      `
        INSERT INTO defense_arrangements
          (id, student_id, topic_id, teacher_id, defense_time, place, defense_group, chair, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, '已安排')
        ON DUPLICATE KEY UPDATE
          topic_id = VALUES(topic_id),
          teacher_id = VALUES(teacher_id),
          defense_time = VALUES(defense_time),
          place = VALUES(place),
          defense_group = VALUES(defense_group),
          chair = VALUES(chair),
          status = '已安排'
      `,
      [
        id,
        studentId,
        application.topic_id,
        application.teacher_id,
        defenseTime,
        req.body.place,
        defenseGroup,
        req.body.chair
      ]
    );

    res.status(201).json({
      success: true,
      message: "答辩安排保存成功",
      data: {
        student_id: studentId,
        status: "已安排"
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDefenses,
  createDefense
};
