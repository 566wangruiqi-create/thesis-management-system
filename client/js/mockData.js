window.MOCK_DATA = {
  users: [
    {
      id: "u-admin",
      username: "admin",
      password: "123456",
      name: "系统管理员",
      role: "admin",
      roleName: "管理员"
    },
    {
      id: "u-teacher",
      username: "teacher",
      password: "123456",
      name: "张明",
      role: "teacher",
      roleName: "教师",
      teacherId: "T001"
    },
    {
      id: "u-student",
      username: "student",
      password: "123456",
      name: "李华",
      role: "student",
      roleName: "学生",
      studentId: "S001"
    }
  ],
  teachers: [
    {
      id: "T001",
      name: "张明",
      college: "信息管理学院",
      title: "副教授",
      phone: "13800010001",
      email: "zhangming@example.edu"
    },
    {
      id: "T002",
      name: "王芳",
      college: "计算机学院",
      title: "讲师",
      phone: "13800010002",
      email: "wangfang@example.edu"
    }
  ],
  students: [
    {
      id: "S001",
      name: "李华",
      className: "信管2201",
      major: "信息管理与信息系统",
      phone: "13900020001",
      email: "lihua@example.edu"
    },
    {
      id: "S002",
      name: "陈雨",
      className: "信管2201",
      major: "信息管理与信息系统",
      phone: "13900020002",
      email: "chenyu@example.edu"
    },
    {
      id: "S003",
      name: "周宁",
      className: "信管2202",
      major: "电子商务",
      phone: "13900020003",
      email: "zhouning@example.edu"
    }
  ],
  topics: [
    {
      id: "TP001",
      title: "基于 Web 的毕业论文管理系统设计",
      teacherId: "T001",
      teacherName: "张明",
      major: "信息管理与信息系统",
      quota: 2,
      selectedCount: 0,
      status: "可选",
      description: "围绕选题、材料审核、答辩安排和归档构建管理信息系统原型。"
    },
    {
      id: "TP002",
      title: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      major: "电子商务",
      quota: 1,
      selectedCount: 1,
      status: "已被选择",
      description: "分析校园二手交易平台的发布、沟通、成交与评价流程。"
    },
    {
      id: "TP003",
      title: "图书馆座位预约系统需求分析",
      teacherId: "T002",
      teacherName: "王芳",
      major: "信息管理与信息系统",
      quota: 2,
      selectedCount: 0,
      status: "可选",
      description: "设计图书馆座位预约、签到、释放与统计模块。"
    },
    {
      id: "TP004",
      title: "智慧教室设备管理系统设计",
      teacherId: "T002",
      teacherName: "王芳",
      major: "计算机科学与技术",
      quota: 1,
      selectedCount: 1,
      status: "已关闭",
      description: "模拟教室设备登记、报修、维护与统计分析流程。"
    }
  ],
  applications: [
    {
      id: "A001",
      studentId: "S002",
      studentName: "陈雨",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      status: "已通过",
      applyDate: "2026-03-06",
      reviewDate: "2026-03-08",
      comment: "同意选题，注意补充业务流程图。"
    },
    {
      id: "A002",
      studentId: "S003",
      studentName: "周宁",
      topicId: "TP003",
      topicTitle: "图书馆座位预约系统需求分析",
      teacherId: "T002",
      teacherName: "王芳",
      status: "待审核",
      applyDate: "2026-03-12",
      reviewDate: "",
      comment: ""
    }
  ],
  materials: [
    {
      id: "M001",
      studentId: "S002",
      studentName: "陈雨",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      type: "开题报告",
      title: "开题报告 v1",
      fileName: "chenyu_opening.docx",
      status: "已通过",
      submitDate: "2026-03-18",
      reviewDate: "2026-03-20",
      reviewComment: "结构完整，可以进入下一阶段。"
    },
    {
      id: "M002",
      studentId: "S002",
      studentName: "陈雨",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      type: "中期检查",
      title: "中期检查材料",
      fileName: "chenyu_midterm.docx",
      status: "待审核",
      submitDate: "2026-04-18",
      reviewDate: "",
      reviewComment: ""
    },
    {
      id: "M003",
      studentId: "S003",
      studentName: "周宁",
      topicId: "TP003",
      topicTitle: "图书馆座位预约系统需求分析",
      teacherId: "T002",
      teacherName: "王芳",
      type: "开题报告",
      title: "开题报告初稿",
      fileName: "zhouning_opening.docx",
      status: "退回修改",
      submitDate: "2026-03-17",
      reviewDate: "2026-03-19",
      reviewComment: "研究目标需要再聚焦，补充用户角色说明。"
    }
  ],
  defenseArrangements: [
    {
      id: "D001",
      studentId: "S002",
      studentName: "陈雨",
      teacherId: "T001",
      teacherName: "张明",
      topicTitle: "校园二手交易平台业务流程优化",
      time: "2026-05-28 09:00",
      place: "明德楼 305",
      group: "第一答辩组",
      chair: "刘教授",
      status: "已安排"
    }
  ],
  grades: [
    {
      id: "G001",
      studentId: "S002",
      studentName: "陈雨",
      teacherId: "T001",
      teacherName: "张明",
      topicTitle: "校园二手交易平台业务流程优化",
      tutorScore: 86,
      defenseScore: 88,
      finalScore: 87,
      passed: true,
      status: "已通过",
      remark: "流程分析清晰，答辩表达稳定。"
    }
  ],
  archives: [
    {
      id: "AR001",
      studentId: "S002",
      studentName: "陈雨",
      teacherId: "T001",
      teacherName: "张明",
      topicTitle: "校园二手交易平台业务流程优化",
      archiveDate: "2026-06-02",
      status: "已归档",
      location: "2026届信管论文档案柜 A-02",
      note: "论文终稿、查重报告、成绩表齐全。"
    }
  ]
};
