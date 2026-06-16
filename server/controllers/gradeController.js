const pool = require("../config/db");
const generateId = require("../utils/idGenerator");

// 查询成绩：学生看自己，教师看自己指导学生，管理员看全部。
async function getGrades(req, res, next) {
  try {
    const params = [];
    let where = "";

    if (req.user.role === "student") {
      where = "WHERE g.student_id = ?";
      params.push(req.user.student_id);
    } else if (req.user.role === "teacher") {
      where = "WHERE g.teacher_id = ?";
      params.push(req.user.teacher_id);
    }

    const [grades] = await pool.query(
      `
        SELECT
          g.id,
          g.student_id,
          s.name AS student_name,
          g.topic_id,
          t.title AS topic_title,
          g.teacher_id,
          te.name AS teacher_name,
          g.tutor_score,
          g.defense_score,
          g.final_score,
          g.passed,
          g.status,
          g.remark,
          g.created_at,
          g.updated_at
        FROM final_grades g
        JOIN students s ON s.id = g.student_id
        JOIN topics t ON t.id = g.topic_id
        JOIN teachers te ON te.id = g.teacher_id
        ${where}
        ORDER BY g.id
      `,
      params
    );

    res.json({
      success: true,
      message: "获取成绩列表成功",
      data: grades
    });
  } catch (error) {
    next(error);
  }
}

// 管理员录入成绩：最终成绩默认按指导评分 40% + 答辩评分 60% 计算。
async function createGrade(req, res, next) {
  try {
    const studentId = req.body.student_id || req.body.studentId;
    const tutorScore = Number(req.body.tutor_score ?? req.body.tutorScore);
    const defenseScore = Number(req.body.defense_score ?? req.body.defenseScore);

    if (!studentId || Number.isNaN(tutorScore) || Number.isNaN(defenseScore)) {
      return res.status(400).json({
        success: false,
        message: "学生编号、指导教师评分和答辩评分不能为空"
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

    const finalScore = req.body.final_score ?? req.body.finalScore;
    const computedFinalScore =
      finalScore === undefined || finalScore === null || finalScore === ""
        ? Math.round(tutorScore * 0.4 + defenseScore * 0.6)
        : Number(finalScore);
    const passed = computedFinalScore >= 60 ? 1 : 0;
    const status = passed ? "已通过" : "未通过";
    const id = await generateId("final_grades", "G");

    await pool.query(
      `
        INSERT INTO final_grades
          (id, student_id, topic_id, teacher_id, tutor_score, defense_score, final_score, passed, status, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          topic_id = VALUES(topic_id),
          teacher_id = VALUES(teacher_id),
          tutor_score = VALUES(tutor_score),
          defense_score = VALUES(defense_score),
          final_score = VALUES(final_score),
          passed = VALUES(passed),
          status = VALUES(status),
          remark = VALUES(remark)
      `,
      [
        id,
        studentId,
        application.topic_id,
        application.teacher_id,
        tutorScore,
        defenseScore,
        computedFinalScore,
        passed,
        status,
        req.body.remark || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "成绩保存成功",
      data: {
        student_id: studentId,
        final_score: computedFinalScore,
        passed: Boolean(passed),
        status
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGrades,
  createGrade
};
