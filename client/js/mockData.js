window.MOCK_DATA = {
  version: "netlify-demo-2026-06-27",
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
      id: "u-teacher-01",
      username: "teacher01",
      password: "123456",
      name: "张明",
      role: "teacher",
      roleName: "教师",
      teacherId: "T001"
    },
    {
      id: "u-teacher-02",
      username: "teacher02",
      password: "123456",
      name: "王芳",
      role: "teacher",
      roleName: "教师",
      teacherId: "T002"
    },
    {
      id: "u-student-01",
      username: "student01",
      password: "123456",
      name: "李华",
      role: "student",
      roleName: "学生",
      studentId: "S001"
    },
    {
      id: "u-student-02",
      username: "student02",
      password: "123456",
      name: "陈雨",
      role: "student",
      roleName: "学生",
      studentId: "S002"
    },
    {
      id: "u-student-03",
      username: "student03",
      password: "123456",
      name: "周宁",
      role: "student",
      roleName: "学生",
      studentId: "S003"
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
    },
    {
      id: "T003",
      name: "刘强",
      college: "信息管理学院",
      title: "教授",
      phone: "13800010003",
      email: "liuqiang@example.edu"
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
    },
    {
      id: "S004",
      name: "赵晨",
      className: "计科2203",
      major: "计算机科学与技术",
      phone: "13900020004",
      email: "zhaochen@example.edu"
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
    },
    {
      id: "TP005",
      title: "高校科研项目申报过程可视化分析",
      teacherId: "T003",
      teacherName: "刘强",
      major: "信息管理与信息系统",
      quota: 2,
      selectedCount: 1,
      status: "可选",
      description: "用看板方式展示项目申报、评审、立项和结题全过程。"
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
    },
    {
      id: "A003",
      studentId: "S004",
      studentName: "赵晨",
      topicId: "TP005",
      topicTitle: "高校科研项目申报过程可视化分析",
      teacherId: "T003",
      teacherName: "刘强",
      status: "已通过",
      applyDate: "2026-03-09",
      reviewDate: "2026-03-10",
      comment: "选题方向明确，可以继续推进。"
    }
  ],
  advisorAssignments: [
    {
      id: "AS001",
      studentId: "S002",
      studentName: "陈雨",
      teacherId: "T001",
      teacherName: "张明",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      assignedDate: "2026-03-08",
      status: "已分配"
    },
    {
      id: "AS002",
      studentId: "S004",
      studentName: "赵晨",
      teacherId: "T003",
      teacherName: "刘强",
      topicId: "TP005",
      topicTitle: "高校科研项目申报过程可视化分析",
      assignedDate: "2026-03-10",
      status: "已分配"
    }
  ],
  tasks: [
    {
      id: "TASK001",
      studentId: "S002",
      studentName: "陈雨",
      teacherId: "T001",
      teacherName: "张明",
      title: "完成开题报告",
      stage: "开题",
      dueDate: "2026-03-18",
      status: "已完成",
      progress: 100
    },
    {
      id: "TASK002",
      studentId: "S002",
      studentName: "陈雨",
      teacherId: "T001",
      teacherName: "张明",
      title: "提交中期检查材料",
      stage: "中期",
      dueDate: "2026-04-20",
      status: "待审核",
      progress: 70
    },
    {
      id: "TASK003",
      studentId: "S003",
      studentName: "周宁",
      teacherId: "T002",
      teacherName: "王芳",
      title: "修改开题报告",
      stage: "开题",
      dueDate: "2026-03-25",
      status: "进行中",
      progress: 40
    },
    {
      id: "TASK004",
      studentId: "S004",
      studentName: "赵晨",
      teacherId: "T003",
      teacherName: "刘强",
      title: "准备论文终稿",
      stage: "终稿",
      dueDate: "2026-05-16",
      status: "进行中",
      progress: 85
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
    },
    {
      id: "M004",
      studentId: "S004",
      studentName: "赵晨",
      topicId: "TP005",
      topicTitle: "高校科研项目申报过程可视化分析",
      teacherId: "T003",
      teacherName: "刘强",
      type: "论文终稿",
      title: "论文终稿",
      fileName: "zhaochen_final.docx",
      status: "已通过",
      submitDate: "2026-05-16",
      reviewDate: "2026-05-18",
      reviewComment: "终稿符合归档要求。"
    }
  ],
  paperSubmissions: [
    {
      id: "P001",
      studentId: "S004",
      studentName: "赵晨",
      topicId: "TP005",
      topicTitle: "高校科研项目申报过程可视化分析",
      teacherId: "T003",
      teacherName: "刘强",
      fileName: "zhaochen_final.docx",
      submitDate: "2026-05-16",
      status: "已通过"
    },
    {
      id: "P002",
      studentId: "S002",
      studentName: "陈雨",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      fileName: "chenyu_final_draft.docx",
      submitDate: "2026-05-12",
      status: "待审核"
    }
  ],
  defenseGroups: [
    {
      id: "DG001",
      name: "第一答辩组",
      chair: "刘强",
      members: ["张明", "王芳"],
      place: "明德楼 305",
      date: "2026-05-28"
    },
    {
      id: "DG002",
      name: "第二答辩组",
      chair: "王芳",
      members: ["张明", "刘强"],
      place: "明德楼 406",
      date: "2026-05-29"
    }
  ],
  defenseArrangements: [
    {
      id: "D001",
      studentId: "S002",
      studentName: "陈雨",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      time: "2026-05-28 09:00",
      place: "明德楼 305",
      group: "第一答辩组",
      chair: "刘强",
      status: "已安排"
    },
    {
      id: "D002",
      studentId: "S004",
      studentName: "赵晨",
      topicId: "TP005",
      topicTitle: "高校科研项目申报过程可视化分析",
      teacherId: "T003",
      teacherName: "刘强",
      time: "2026-05-29 10:30",
      place: "明德楼 406",
      group: "第二答辩组",
      chair: "王芳",
      status: "已安排"
    }
  ],
  grades: [
    {
      id: "G001",
      studentId: "S002",
      studentName: "陈雨",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      tutorScore: 86,
      defenseScore: 88,
      finalScore: 87,
      passed: true,
      status: "已通过",
      remark: "流程分析清晰，答辩表达稳定。"
    },
    {
      id: "G002",
      studentId: "S004",
      studentName: "赵晨",
      topicId: "TP005",
      topicTitle: "高校科研项目申报过程可视化分析",
      teacherId: "T003",
      teacherName: "刘强",
      tutorScore: 91,
      defenseScore: 90,
      finalScore: 90,
      passed: true,
      status: "已通过",
      remark: "数据分析展示完整，系统原型清晰。"
    }
  ],
  archives: [
    {
      id: "AR001",
      studentId: "S002",
      studentName: "陈雨",
      topicId: "TP002",
      topicTitle: "校园二手交易平台业务流程优化",
      teacherId: "T001",
      teacherName: "张明",
      archiveDate: "2026-06-02",
      status: "已归档",
      location: "2026届信管论文档案柜 A-02",
      note: "论文终稿、查重报告、成绩表齐全。"
    }
  ],
  reviewRecords: [
    {
      id: "RR001",
      targetType: "选题申请",
      targetId: "A001",
      reviewerId: "T001",
      reviewerName: "张明",
      result: "已通过",
      comment: "同意选题，注意补充业务流程图。",
      reviewDate: "2026-03-08"
    },
    {
      id: "RR002",
      targetType: "开题报告",
      targetId: "M001",
      reviewerId: "T001",
      reviewerName: "张明",
      result: "已通过",
      comment: "结构完整，可以进入下一阶段。",
      reviewDate: "2026-03-20"
    },
    {
      id: "RR003",
      targetType: "开题报告",
      targetId: "M003",
      reviewerId: "T002",
      reviewerName: "王芳",
      result: "退回修改",
      comment: "研究目标需要再聚焦，补充用户角色说明。",
      reviewDate: "2026-03-19"
    }
  ],
  operationLogs: [
    {
      id: "LOG001",
      time: "2026-03-06 09:18",
      actor: "陈雨",
      role: "学生",
      action: "提交选题申请",
      detail: "申请课题：校园二手交易平台业务流程优化"
    },
    {
      id: "LOG002",
      time: "2026-03-08 14:20",
      actor: "张明",
      role: "教师",
      action: "审核选题申请",
      detail: "通过陈雨的选题申请"
    },
    {
      id: "LOG003",
      time: "2026-05-28 16:30",
      actor: "系统管理员",
      role: "管理员",
      action: "录入成绩",
      detail: "陈雨最终成绩 87 分"
    }
  ]
};
