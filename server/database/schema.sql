-- 毕业论文管理系统 MySQL 数据库结构
-- 当前阶段根据 client/js/mockData.js 的字段设计

CREATE DATABASE IF NOT EXISTS graduation_thesis_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE graduation_thesis_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS operation_logs;
DROP TABLE IF EXISTS archives;
DROP TABLE IF EXISTS final_grades;
DROP TABLE IF EXISTS defense_arrangements;
DROP TABLE IF EXISTS thesis_materials;
DROP TABLE IF EXISTS topic_applications;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE teachers (
  id VARCHAR(20) PRIMARY KEY COMMENT '教师编号，对应 mockData.teachers.id',
  name VARCHAR(50) NOT NULL COMMENT '教师姓名',
  college VARCHAR(100) NOT NULL COMMENT '学院',
  title VARCHAR(50) NOT NULL COMMENT '职称',
  phone VARCHAR(30) NOT NULL COMMENT '联系电话',
  email VARCHAR(100) NOT NULL COMMENT '邮箱',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师表';

CREATE TABLE students (
  id VARCHAR(20) PRIMARY KEY COMMENT '学生编号，对应 mockData.students.id',
  name VARCHAR(50) NOT NULL COMMENT '学生姓名',
  class_name VARCHAR(50) NOT NULL COMMENT '班级，对应 className',
  major VARCHAR(100) NOT NULL COMMENT '专业',
  phone VARCHAR(30) NOT NULL COMMENT '联系电话',
  email VARCHAR(100) NOT NULL COMMENT '邮箱',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生表';

CREATE TABLE users (
  id VARCHAR(30) PRIMARY KEY COMMENT '用户编号，对应 mockData.users.id',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
  password VARCHAR(255) NOT NULL COMMENT '登录密码；原型阶段沿用 mockData，后端阶段建议改为哈希值',
  name VARCHAR(50) NOT NULL COMMENT '用户显示名称',
  role ENUM('admin', 'teacher', 'student') NOT NULL COMMENT '角色',
  role_name VARCHAR(20) NOT NULL COMMENT '角色中文名称，对应 roleName',
  teacher_id VARCHAR(20) NULL COMMENT '教师角色关联教师编号',
  student_id VARCHAR(20) NULL COMMENT '学生角色关联学生编号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_users_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_users_role (role),
  INDEX idx_users_teacher_id (teacher_id),
  INDEX idx_users_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE topics (
  id VARCHAR(20) PRIMARY KEY COMMENT '课题编号，对应 mockData.topics.id',
  title VARCHAR(200) NOT NULL COMMENT '课题名称',
  teacher_id VARCHAR(20) NOT NULL COMMENT '发布教师编号',
  major VARCHAR(100) NOT NULL COMMENT '适用专业',
  quota INT NOT NULL DEFAULT 1 COMMENT '可选人数',
  selected_count INT NOT NULL DEFAULT 0 COMMENT '已选人数，对应 selectedCount',
  status ENUM('可选', '已被选择', '已关闭') NOT NULL DEFAULT '可选' COMMENT '课题状态',
  description TEXT NULL COMMENT '课题说明',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_topics_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_topics_quota CHECK (quota >= 1),
  CONSTRAINT chk_topics_selected_count CHECK (selected_count >= 0),
  INDEX idx_topics_teacher_id (teacher_id),
  INDEX idx_topics_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课题表';

CREATE TABLE topic_applications (
  id VARCHAR(20) PRIMARY KEY COMMENT '选题申请编号，对应 mockData.applications.id',
  student_id VARCHAR(20) NOT NULL COMMENT '申请学生编号',
  topic_id VARCHAR(20) NOT NULL COMMENT '申请课题编号',
  teacher_id VARCHAR(20) NOT NULL COMMENT '审核教师编号',
  status ENUM('待审核', '已通过', '已拒绝') NOT NULL DEFAULT '待审核' COMMENT '申请状态',
  apply_date DATE NOT NULL COMMENT '申请日期，对应 applyDate',
  review_date DATE NULL COMMENT '审核日期，对应 reviewDate',
  comment VARCHAR(500) NULL COMMENT '审核意见',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_applications_topic FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_applications_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_applications_student_id (student_id),
  INDEX idx_applications_topic_id (topic_id),
  INDEX idx_applications_teacher_id (teacher_id),
  INDEX idx_applications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='选题申请表';

CREATE TABLE thesis_materials (
  id VARCHAR(20) PRIMARY KEY COMMENT '材料编号，对应 mockData.materials.id',
  student_id VARCHAR(20) NOT NULL COMMENT '提交学生编号',
  topic_id VARCHAR(20) NOT NULL COMMENT '所属课题编号',
  teacher_id VARCHAR(20) NOT NULL COMMENT '审核教师编号',
  type ENUM('开题报告', '中期检查', '论文终稿') NOT NULL COMMENT '材料类型',
  title VARCHAR(200) NOT NULL COMMENT '材料标题',
  file_name VARCHAR(255) NULL COMMENT '文件名，对应 fileName',
  status ENUM('未提交', '待审核', '已通过', '退回修改') NOT NULL DEFAULT '未提交' COMMENT '审核状态',
  submit_date DATE NULL COMMENT '提交日期，对应 submitDate',
  review_date DATE NULL COMMENT '审核日期，对应 reviewDate',
  review_comment VARCHAR(500) NULL COMMENT '审核意见，对应 reviewComment',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_materials_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_materials_topic FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_materials_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uk_materials_student_type (student_id, type),
  INDEX idx_materials_teacher_id (teacher_id),
  INDEX idx_materials_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论文过程材料表';

CREATE TABLE defense_arrangements (
  id VARCHAR(20) PRIMARY KEY COMMENT '答辩安排编号，对应 mockData.defenseArrangements.id',
  student_id VARCHAR(20) NOT NULL COMMENT '答辩学生编号',
  topic_id VARCHAR(20) NOT NULL COMMENT '答辩课题编号',
  teacher_id VARCHAR(20) NOT NULL COMMENT '指导教师编号',
  defense_time DATETIME NOT NULL COMMENT '答辩时间，对应 time',
  place VARCHAR(100) NOT NULL COMMENT '答辩地点',
  defense_group VARCHAR(100) NOT NULL COMMENT '答辩小组，对应 group',
  chair VARCHAR(50) NOT NULL COMMENT '答辩组长',
  status ENUM('已安排') NOT NULL DEFAULT '已安排' COMMENT '安排状态',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_defense_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_defense_topic FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_defense_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uk_defense_student (student_id),
  INDEX idx_defense_teacher_id (teacher_id),
  INDEX idx_defense_time (defense_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答辩安排表';

CREATE TABLE final_grades (
  id VARCHAR(20) PRIMARY KEY COMMENT '成绩编号，对应 mockData.grades.id',
  student_id VARCHAR(20) NOT NULL COMMENT '学生编号',
  topic_id VARCHAR(20) NOT NULL COMMENT '课题编号',
  teacher_id VARCHAR(20) NOT NULL COMMENT '指导教师编号',
  tutor_score DECIMAL(5,2) NOT NULL COMMENT '指导教师评分，对应 tutorScore',
  defense_score DECIMAL(5,2) NOT NULL COMMENT '答辩评分，对应 defenseScore',
  final_score DECIMAL(5,2) NOT NULL COMMENT '最终成绩，对应 finalScore',
  passed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否通过，对应 passed',
  status ENUM('已通过', '未通过') NOT NULL COMMENT '成绩状态',
  remark VARCHAR(500) NULL COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_grades_topic FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_grades_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_grades_tutor_score CHECK (tutor_score >= 0 AND tutor_score <= 100),
  CONSTRAINT chk_grades_defense_score CHECK (defense_score >= 0 AND defense_score <= 100),
  CONSTRAINT chk_grades_final_score CHECK (final_score >= 0 AND final_score <= 100),
  UNIQUE KEY uk_grades_student (student_id),
  INDEX idx_grades_teacher_id (teacher_id),
  INDEX idx_grades_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='最终成绩表';

CREATE TABLE archives (
  id VARCHAR(20) PRIMARY KEY COMMENT '归档编号，对应 mockData.archives.id',
  student_id VARCHAR(20) NOT NULL COMMENT '学生编号',
  topic_id VARCHAR(20) NOT NULL COMMENT '课题编号',
  teacher_id VARCHAR(20) NOT NULL COMMENT '指导教师编号',
  archive_date DATE NULL COMMENT '归档日期，对应 archiveDate',
  status ENUM('未归档', '已归档') NOT NULL DEFAULT '未归档' COMMENT '归档状态',
  location VARCHAR(200) NULL COMMENT '存放位置',
  note VARCHAR(500) NULL COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_archives_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_archives_topic FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_archives_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uk_archives_student (student_id),
  INDEX idx_archives_teacher_id (teacher_id),
  INDEX idx_archives_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论文归档表';

CREATE TABLE operation_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志编号',
  user_id VARCHAR(30) NULL COMMENT '操作用户编号',
  action VARCHAR(100) NOT NULL COMMENT '操作类型',
  target_table VARCHAR(100) NULL COMMENT '操作对象表名',
  target_id VARCHAR(50) NULL COMMENT '操作对象编号',
  detail VARCHAR(1000) NULL COMMENT '操作详情',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_operation_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_logs_user_id (user_id),
  INDEX idx_logs_target (target_table, target_id),
  INDEX idx_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
