const pool = require("../config/db");
const generateId = require("../utils/idGenerator");

// 查询归档：学生看自己，教师看自己指导学生，管理员看全部。
async function getArchives(req, res, next) {
  try {
    const params = [];
    let where = "";

    if (req.user.role === "student") {
      where = "WHERE a.student_id = ?";
      params.push(req.user.student_id);
    } else if (req.user.role === "teacher") {
      where = "WHERE a.teacher_id = ?";
      params.push(req.user.teacher_id);
    }

    const [archives] = await pool.query(
      `
        SELECT
          a.id,
          a.student_id,
          s.name AS student_name,
          a.topic_id,
          t.title AS topic_title,
          a.teacher_id,
          te.name AS teacher_name,
          a.archive_date,
          a.status,
          a.location,
          a.note,
          a.created_at,
          a.updated_at
        FROM archives a
        JOIN students s ON s.id = a.student_id
        JOIN topics t ON t.id = a.topic_id
        JOIN teachers te ON te.id = a.teacher_id
        ${where}
        ORDER BY a.archive_date DESC, a.id DESC
      `,
      params
    );

    res.json({
      success: true,
      message: "获取归档列表成功",
      data: archives
    });
  } catch (error) {
    next(error);
  }
}

// 管理员归档：只有成绩通过的学生才允许完成归档。
async function createArchive(req, res, next) {
  try {
    const studentId = req.body.student_id || req.body.studentId;

    if (!studentId || !req.body.location) {
      return res.status(400).json({
        success: false,
        message: "学生编号和存放位置不能为空"
      });
    }

    const [grades] = await pool.query(
      "SELECT * FROM final_grades WHERE student_id = ? AND passed = 1 ORDER BY updated_at DESC LIMIT 1",
      [studentId]
    );
    const grade = grades[0];

    if (!grade) {
      return res.status(400).json({
        success: false,
        message: "该学生尚无通过成绩，不能归档"
      });
    }

    const id = await generateId("archives", "AR");
    await pool.query(
      `
        INSERT INTO archives
          (id, student_id, topic_id, teacher_id, archive_date, status, location, note)
        VALUES (?, ?, ?, ?, ?, '已归档', ?, ?)
        ON DUPLICATE KEY UPDATE
          topic_id = VALUES(topic_id),
          teacher_id = VALUES(teacher_id),
          archive_date = VALUES(archive_date),
          status = '已归档',
          location = VALUES(location),
          note = VALUES(note)
      `,
      [
        id,
        studentId,
        grade.topic_id,
        grade.teacher_id,
        req.body.archive_date || req.body.archiveDate || new Date(),
        req.body.location,
        req.body.note || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "论文归档成功",
      data: {
        student_id: studentId,
        status: "已归档"
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getArchives,
  createArchive
};
