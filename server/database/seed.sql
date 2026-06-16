-- 毕业论文管理系统 MySQL 初始数据
-- 数据来源：client/js/mockData.js

USE graduation_thesis_system;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE operation_logs;
TRUNCATE TABLE archives;
TRUNCATE TABLE final_grades;
TRUNCATE TABLE defense_arrangements;
TRUNCATE TABLE thesis_materials;
TRUNCATE TABLE topic_applications;
TRUNCATE TABLE topics;
TRUNCATE TABLE users;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO teachers (id, name, college, title, phone, email) VALUES
  ('T001', '张明', '信息管理学院', '副教授', '13800010001', 'zhangming@example.edu'),
  ('T002', '王芳', '计算机学院', '讲师', '13800010002', 'wangfang@example.edu');

INSERT INTO students (id, name, class_name, major, phone, email) VALUES
  ('S001', '李华', '信管2201', '信息管理与信息系统', '13900020001', 'lihua@example.edu'),
  ('S002', '陈雨', '信管2201', '信息管理与信息系统', '13900020002', 'chenyu@example.edu'),
  ('S003', '周宁', '信管2202', '电子商务', '13900020003', 'zhouning@example.edu');

INSERT INTO users (id, username, password, name, role, role_name, teacher_id, student_id) VALUES
  ('u-admin', 'admin', '123456', '系统管理员', 'admin', '管理员', NULL, NULL),
  ('u-teacher', 'teacher', '123456', '张明', 'teacher', '教师', 'T001', NULL),
  ('u-student', 'student', '123456', '李华', 'student', '学生', NULL, 'S001');

INSERT INTO topics (id, title, teacher_id, major, quota, selected_count, status, description) VALUES
  ('TP001', '基于 Web 的毕业论文管理系统设计', 'T001', '信息管理与信息系统', 2, 0, '可选', '围绕选题、材料审核、答辩安排和归档构建管理信息系统原型。'),
  ('TP002', '校园二手交易平台业务流程优化', 'T001', '电子商务', 1, 1, '已被选择', '分析校园二手交易平台的发布、沟通、成交与评价流程。'),
  ('TP003', '图书馆座位预约系统需求分析', 'T002', '信息管理与信息系统', 2, 0, '可选', '设计图书馆座位预约、签到、释放与统计模块。'),
  ('TP004', '智慧教室设备管理系统设计', 'T002', '计算机科学与技术', 1, 1, '已关闭', '模拟教室设备登记、报修、维护与统计分析流程。');

INSERT INTO topic_applications (id, student_id, topic_id, teacher_id, status, apply_date, review_date, comment) VALUES
  ('A001', 'S002', 'TP002', 'T001', '已通过', '2026-03-06', '2026-03-08', '同意选题，注意补充业务流程图。'),
  ('A002', 'S003', 'TP003', 'T002', '待审核', '2026-03-12', NULL, NULL);

INSERT INTO thesis_materials (
  id,
  student_id,
  topic_id,
  teacher_id,
  type,
  title,
  file_name,
  status,
  submit_date,
  review_date,
  review_comment
) VALUES
  ('M001', 'S002', 'TP002', 'T001', '开题报告', '开题报告 v1', 'chenyu_opening.docx', '已通过', '2026-03-18', '2026-03-20', '结构完整，可以进入下一阶段。'),
  ('M002', 'S002', 'TP002', 'T001', '中期检查', '中期检查材料', 'chenyu_midterm.docx', '待审核', '2026-04-18', NULL, NULL),
  ('M003', 'S003', 'TP003', 'T002', '开题报告', '开题报告初稿', 'zhouning_opening.docx', '退回修改', '2026-03-17', '2026-03-19', '研究目标需要再聚焦，补充用户角色说明。');

INSERT INTO defense_arrangements (
  id,
  student_id,
  topic_id,
  teacher_id,
  defense_time,
  place,
  defense_group,
  chair,
  status
) VALUES
  ('D001', 'S002', 'TP002', 'T001', '2026-05-28 09:00:00', '明德楼 305', '第一答辩组', '刘教授', '已安排');

INSERT INTO final_grades (
  id,
  student_id,
  topic_id,
  teacher_id,
  tutor_score,
  defense_score,
  final_score,
  passed,
  status,
  remark
) VALUES
  ('G001', 'S002', 'TP002', 'T001', 86.00, 88.00, 87.00, 1, '已通过', '流程分析清晰，答辩表达稳定。');

INSERT INTO archives (
  id,
  student_id,
  topic_id,
  teacher_id,
  archive_date,
  status,
  location,
  note
) VALUES
  ('AR001', 'S002', 'TP002', 'T001', '2026-06-02', '已归档', '2026届信管论文档案柜 A-02', '论文终稿、查重报告、成绩表齐全。');
