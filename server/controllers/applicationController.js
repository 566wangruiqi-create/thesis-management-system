const pool = require("../config/db");
const generateId = require("../utils/idGenerator");

async function getNextMaterialIds(connection, count) {
  const [rows] = await connection.query(
    "SELECT id FROM thesis_materials WHERE id LIKE 'M%' ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) DESC LIMIT 1"
  );
  const start = rows[0] ? Number(rows[0].id.replace("M", "")) + 1 : 1;
  return Array.from({ length: count }, (_, index) => `M${String(start + index).padStart(3, "0")}`);
}

// 查询选题申请：学生看自己，教师看自己课题相关申请，管理员看全部。
async function getApplications(req, res, next) {
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

    const [applications] = await pool.query(
      `
        SELECT
          a.id,
          a.student_id,
          s.name AS student_name,
          a.topic_id,
          t.title AS topic_title,
          a.teacher_id,
          te.name AS teacher_name,
          a.status,
          a.apply_date,
          a.review_date,
          a.comment,
          a.created_at,
          a.updated_at
        FROM topic_applications a
        JOIN students s ON s.id = a.student_id
        JOIN topics t ON t.id = a.topic_id
        JOIN teachers te ON te.id = a.teacher_id
        ${where}
        ORDER BY a.apply_date DESC, a.id DESC
      `,
      params
    );

    res.json({
      success: true,
      message: "获取选题申请成功",
      data: applications
    });
  } catch (error) {
    next(error);
  }
}

// 学生申请选题：根据课题自动绑定指导教师，申请初始状态为“待审核”。
async function createApplication(req, res, next) {
  try {
    const topicId = req.body.topic_id || req.body.topicId;
    const studentId = req.user.student_id;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: "课题编号不能为空"
      });
    }

    const [topics] = await pool.query("SELECT * FROM topics WHERE id = ?", [topicId]);
    const topic = topics[0];

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "课题不存在"
      });
    }

    if (topic.status !== "可选") {
      return res.status(400).json({
        success: false,
        message: "该课题当前不可申请"
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM topic_applications WHERE student_id = ? AND topic_id = ? AND status <> '已拒绝'",
      [studentId, topicId]
    );
    if (existing[0]) {
      return res.status(400).json({
        success: false,
        message: "你已经提交过该课题申请"
      });
    }

    const id = await generateId("topic_applications", "A");
    await pool.query(
      `INSERT INTO topic_applications (id, student_id, topic_id, teacher_id, status, apply_date, comment)
       VALUES (?, ?, ?, ?, '待审核', CURDATE(), NULL)`,
      [id, studentId, topicId, topic.teacher_id]
    );

    res.status(201).json({
      success: true,
      message: "提交选题申请成功",
      data: { id }
    });
  } catch (error) {
    next(error);
  }
}

// 教师审核通过：更新申请状态、课题已选人数，并初始化学生三类过程材料记录。
async function approveApplication(req, res, next) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT a.*, t.quota, t.selected_count
        FROM topic_applications a
        JOIN topics t ON t.id = a.topic_id
        WHERE a.id = ?
      `,
      [req.params.id]
    );
    const application = rows[0];

    if (!application) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "选题申请不存在"
      });
    }

    if (req.user.role === "teacher" && application.teacher_id !== req.user.teacher_id) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: "只能审核自己课题相关的申请"
      });
    }

    const comment = req.body.comment || "审核通过";
    await connection.query(
      "UPDATE topic_applications SET status = '已通过', review_date = CURDATE(), comment = ? WHERE id = ?",
      [comment, req.params.id]
    );

    const nextSelectedCount = Number(application.selected_count) + 1;
    const nextTopicStatus = nextSelectedCount >= Number(application.quota) ? "已被选择" : "可选";
    await connection.query(
      "UPDATE topics SET selected_count = ?, status = ? WHERE id = ?",
      [nextSelectedCount, nextTopicStatus, application.topic_id]
    );

    const materialTypes = ["开题报告", "中期检查", "论文终稿"];
    const materialIds = await getNextMaterialIds(connection, materialTypes.length);

    for (let index = 0; index < materialTypes.length; index += 1) {
      await connection.query(
        `
          INSERT IGNORE INTO thesis_materials
            (id, student_id, topic_id, teacher_id, type, title, file_name, status)
          VALUES (?, ?, ?, ?, ?, ?, NULL, '未提交')
        `,
        [
          materialIds[index],
          application.student_id,
          application.topic_id,
          application.teacher_id,
          materialTypes[index],
          `${materialTypes[index]}材料`
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "选题申请已通过",
      data: {
        id: req.params.id,
        status: "已通过"
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// 教师拒绝申请：记录拒绝意见，学生后续可以重新选择其他课题。
async function rejectApplication(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM topic_applications WHERE id = ?", [req.params.id]);
    const application = rows[0];

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "选题申请不存在"
      });
    }

    if (req.user.role === "teacher" && application.teacher_id !== req.user.teacher_id) {
      return res.status(403).json({
        success: false,
        message: "只能审核自己课题相关的申请"
      });
    }

    await pool.query(
      "UPDATE topic_applications SET status = '已拒绝', review_date = CURDATE(), comment = ? WHERE id = ?",
      [req.body.comment || "申请不通过，请调整选题方向", req.params.id]
    );

    res.json({
      success: true,
      message: "选题申请已拒绝",
      data: {
        id: req.params.id,
        status: "已拒绝"
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getApplications,
  createApplication,
  approveApplication,
  rejectApplication
};
