const pool = require("../config/db");
const generateId = require("../utils/idGenerator");
const { mapMaterialType, mapMaterialStatus } = require("../utils/statusMapper");

// 查询材料：学生看自己，教师看自己指导学生，管理员看全部。
async function getMaterials(req, res, next) {
  try {
    const params = [];
    let where = "";

    if (req.user.role === "student") {
      where = "WHERE m.student_id = ?";
      params.push(req.user.student_id);
    } else if (req.user.role === "teacher") {
      where = "WHERE m.teacher_id = ?";
      params.push(req.user.teacher_id);
    }

    const [materials] = await pool.query(
      `
        SELECT
          m.id,
          m.student_id,
          s.name AS student_name,
          m.topic_id,
          t.title AS topic_title,
          m.teacher_id,
          te.name AS teacher_name,
          m.type,
          m.title,
          m.file_name,
          m.status,
          m.submit_date,
          m.review_date,
          m.review_comment,
          m.created_at,
          m.updated_at
        FROM thesis_materials m
        JOIN students s ON s.id = m.student_id
        JOIN topics t ON t.id = m.topic_id
        JOIN teachers te ON te.id = m.teacher_id
        ${where}
        ORDER BY m.student_id, FIELD(m.type, '开题报告', '中期检查', '论文终稿')
      `,
      params
    );

    res.json({
      success: true,
      message: "获取材料列表成功",
      data: materials
    });
  } catch (error) {
    next(error);
  }
}

// 学生提交材料：根据已通过选题自动绑定 topic_id 和 teacher_id。
async function submitMaterial(req, res, next) {
  try {
    const type = mapMaterialType(req.body.type);
    const title = req.body.title || `${type}材料`;
    const fileName = req.body.file_name || req.body.fileName || null;

    if (!type || !["开题报告", "中期检查", "论文终稿"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "材料类型不正确"
      });
    }

    const [applications] = await pool.query(
      "SELECT * FROM topic_applications WHERE student_id = ? AND status = '已通过' ORDER BY review_date DESC LIMIT 1",
      [req.user.student_id]
    );
    const application = applications[0];

    if (!application) {
      return res.status(400).json({
        success: false,
        message: "只有选题审核通过后才能提交材料"
      });
    }

    const id = await generateId("thesis_materials", "M");
    await pool.query(
      `
        INSERT INTO thesis_materials
          (id, student_id, topic_id, teacher_id, type, title, file_name, status, submit_date, review_date, review_comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, '待审核', CURDATE(), NULL, NULL)
        ON DUPLICATE KEY UPDATE
          topic_id = VALUES(topic_id),
          teacher_id = VALUES(teacher_id),
          title = VALUES(title),
          file_name = VALUES(file_name),
          status = '待审核',
          submit_date = CURDATE(),
          review_date = NULL,
          review_comment = NULL
      `,
      [
        id,
        req.user.student_id,
        application.topic_id,
        application.teacher_id,
        type,
        title,
        fileName
      ]
    );

    res.status(201).json({
      success: true,
      message: "提交材料成功",
      data: {
        type,
        status: "待审核"
      }
    });
  } catch (error) {
    next(error);
  }
}

// 教师审核材料：只允许审核自己指导学生提交的材料，可通过或退回修改。
async function reviewMaterial(req, res, next) {
  try {
    const nextStatus = mapMaterialStatus(req.body.status);

    if (!["已通过", "退回修改"].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "材料审核状态只能是 approved 或 returned"
      });
    }

    const [rows] = await pool.query("SELECT * FROM thesis_materials WHERE id = ?", [req.params.id]);
    const material = rows[0];

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "材料记录不存在"
      });
    }

    if (material.teacher_id !== req.user.teacher_id) {
      return res.status(403).json({
        success: false,
        message: "只能审核自己指导学生的材料"
      });
    }

    await pool.query(
      "UPDATE thesis_materials SET status = ?, review_date = CURDATE(), review_comment = ? WHERE id = ?",
      [nextStatus, req.body.review_comment || req.body.reviewComment || "", req.params.id]
    );

    res.json({
      success: true,
      message: "材料审核成功",
      data: {
        id: req.params.id,
        status: nextStatus
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMaterials,
  submitMaterial,
  reviewMaterial
};
