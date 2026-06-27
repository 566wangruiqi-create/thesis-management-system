(function () {
  const MODE_KEY = "thesis_demo_mode";
  const DATA_KEY = "thesis_demo_data";
  const REASON_KEY = "thesis_demo_reason";
  const USER_KEY = "thesis_current_user";

  const REQUIRED_LISTS = [
    "users",
    "teachers",
    "students",
    "topics",
    "applications",
    "advisorAssignments",
    "tasks",
    "materials",
    "paperSubmissions",
    "defenseGroups",
    "defenseArrangements",
    "grades",
    "archives",
    "reviewRecords",
    "operationLogs"
  ];

  const roleNames = {
    admin: "管理员",
    teacher: "教师",
    student: "学生"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function seedData() {
    return clone(window.MOCK_DATA || { version: "demo", users: [] });
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function nowDateTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  function sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  function currentUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  function requireUser() {
    const user = currentUser();
    if (!user) throw new Error("请先登录。");
    return user;
  }

  function ensureDataShape(data) {
    const seed = seedData();
    if (!data || data.version !== seed.version) {
      return seed;
    }

    REQUIRED_LISTS.forEach((key) => {
      if (!Array.isArray(data[key])) {
        data[key] = clone(seed[key] || []);
      }
    });

    return data;
  }

  function getData() {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) {
      const fresh = seedData();
      saveData(fresh);
      return fresh;
    }

    try {
      const data = ensureDataShape(JSON.parse(raw));
      saveData(data);
      return data;
    } catch (error) {
      const fresh = seedData();
      saveData(fresh);
      return fresh;
    }
  }

  function saveData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  function resetDemoData() {
    const fresh = seedData();
    saveData(fresh);
    return clone(fresh);
  }

  function nextId(prefix, list) {
    const max = list
      .map((item) => Number(String(item.id || "").replace(/^\D+/, "")))
      .filter((num) => !Number.isNaN(num))
      .reduce((acc, num) => Math.max(acc, num), 0);
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
  }

  function findStudent(data, studentId) {
    return data.students.find((student) => student.id === studentId);
  }

  function findTeacher(data, teacherId) {
    return data.teachers.find((teacher) => teacher.id === teacherId);
  }

  function findTopic(data, topicId) {
    return data.topics.find((topic) => topic.id === topicId);
  }

  function approvedApplication(data, studentId) {
    return data.applications.find(
      (item) => item.studentId === studentId && item.status === "已通过"
    );
  }

  function visibleForRole(items, user) {
    if (!user || user.role === "admin") return items;
    if (user.role === "teacher") {
      return items.filter((item) => item.teacherId === user.teacherId);
    }
    if (user.role === "student") {
      return items.filter((item) => item.studentId === user.studentId);
    }
    return [];
  }

  function addOperationLog(data, user, action, detail) {
    data.operationLogs.unshift({
      id: nextId("LOG", data.operationLogs),
      time: nowDateTime(),
      actor: user.name,
      role: roleNames[user.role] || user.role,
      action,
      detail
    });
  }

  function addReviewRecord(data, targetType, targetId, reviewer, result, comment) {
    data.reviewRecords.unshift({
      id: nextId("RR", data.reviewRecords),
      targetType,
      targetId,
      reviewerId: reviewer.teacherId || reviewer.id,
      reviewerName: reviewer.name,
      result,
      comment,
      reviewDate: today()
    });
  }

  function ensureAdvisorAssignment(data, application) {
    const exists = data.advisorAssignments.some(
      (item) => item.studentId === application.studentId && item.topicId === application.topicId
    );
    if (exists) return;

    data.advisorAssignments.push({
      id: nextId("AS", data.advisorAssignments),
      studentId: application.studentId,
      studentName: application.studentName,
      teacherId: application.teacherId,
      teacherName: application.teacherName,
      topicId: application.topicId,
      topicTitle: application.topicTitle,
      assignedDate: today(),
      status: "已分配"
    });
  }

  function ensureProcessTasks(data, application) {
    [
      ["开题", "完成开题报告", 14],
      ["中期", "提交中期检查材料", 42],
      ["终稿", "提交论文终稿", 70]
    ].forEach(([stage, title, offset]) => {
      const exists = data.tasks.some(
        (task) => task.studentId === application.studentId && task.stage === stage
      );
      if (exists) return;

      const due = new Date();
      due.setDate(due.getDate() + offset);
      data.tasks.push({
        id: nextId("TASK", data.tasks),
        studentId: application.studentId,
        studentName: application.studentName,
        teacherId: application.teacherId,
        teacherName: application.teacherName,
        title,
        stage,
        dueDate: due.toISOString().slice(0, 10),
        status: "未开始",
        progress: 0
      });
    });
  }

  function ensureMaterials(data, application) {
    ["开题报告", "中期检查", "论文终稿"].forEach((type) => {
      const exists = data.materials.some(
        (item) => item.studentId === application.studentId && item.type === type
      );
      if (exists) return;

      data.materials.push({
        id: nextId("M", data.materials),
        studentId: application.studentId,
        studentName: application.studentName,
        topicId: application.topicId,
        topicTitle: application.topicTitle,
        teacherId: application.teacherId,
        teacherName: application.teacherName,
        type,
        title: `${type}材料`,
        fileName: "",
        status: "未提交",
        submitDate: "",
        reviewDate: "",
        reviewComment: ""
      });
    });
  }

  function syncPaperSubmission(data, material) {
    if (material.type !== "论文终稿") return;

    let record = data.paperSubmissions.find((item) => item.studentId === material.studentId);
    if (!record) {
      record = {
        id: nextId("P", data.paperSubmissions),
        studentId: material.studentId,
        studentName: material.studentName,
        topicId: material.topicId,
        topicTitle: material.topicTitle,
        teacherId: material.teacherId,
        teacherName: material.teacherName,
        fileName: "",
        submitDate: "",
        status: "未提交"
      };
      data.paperSubmissions.unshift(record);
    }

    record.fileName = material.fileName;
    record.submitDate = material.submitDate;
    record.status = material.status;
  }

  function updateTaskFromMaterial(data, material) {
    const stageMap = {
      开题报告: "开题",
      中期检查: "中期",
      论文终稿: "终稿"
    };
    const task = data.tasks.find(
      (item) => item.studentId === material.studentId && item.stage === stageMap[material.type]
    );
    if (!task) return;

    task.status = material.status;
    task.progress = material.status === "已通过" ? 100 : Math.max(task.progress || 0, 70);
  }

  function resetUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("demo", "1");
    url.searchParams.set("resetDemo", "1");
    return url.toString();
  }

  function isDemoMode() {
    return localStorage.getItem(MODE_KEY) === "1";
  }

  function renderBanner() {
    const existing = document.querySelector(".demo-mode-banner");
    if (!isDemoMode()) {
      document.body.classList.remove("demo-mode-active");
      if (existing) existing.remove();
      return;
    }

    document.body.classList.add("demo-mode-active");
    if (existing) return;

    const banner = document.createElement("div");
    banner.className = "demo-mode-banner";
    banner.innerHTML = `
      <span>当前为前端演示模式，数据保存在浏览器本地。</span>
      <a href="${resetUrl()}">重置演示数据</a>
    `;
    document.body.prepend(banner);
  }

  function setDemoMode(active, reason = "") {
    if (active) {
      localStorage.setItem(MODE_KEY, "1");
      if (reason) localStorage.setItem(REASON_KEY, reason);
    } else {
      localStorage.removeItem(MODE_KEY);
      localStorage.removeItem(REASON_KEY);
    }

    window.dispatchEvent(new CustomEvent("demo-mode-change", { detail: { active, reason } }));
    if (document.body) renderBanner();
  }

  function activate(reason) {
    setDemoMode(true, reason || "已进入前端演示模式");
  }

  function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetDemo") === "1") {
      resetDemoData();
      params.delete("resetDemo");
      params.set("demo", "1");
      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", nextUrl);
      activate("演示数据已重置");
      return;
    }

    if (params.get("demo") === "1") {
      activate("URL 参数强制进入演示模式");
    } else if (params.get("demo") === "0") {
      setDemoMode(false);
    } else if (
      window.location.protocol === "file:" ||
      !["localhost", "127.0.0.1", ""].includes(window.location.hostname)
    ) {
      activate("静态站点默认进入前端演示模式");
    }
  }

  const ThesisDemoAPI = {
    activate,
    setDemoMode,
    isDemoMode,
    resetDemoData,

    getAllData() {
      return clone(getData());
    },

    login(username, password) {
      const data = getData();
      const user = data.users.find(
        (item) => item.username === username && item.password === password
      );
      if (!user) throw new Error("账号或密码不正确。");

      addOperationLog(data, user, "登录演示系统", `账号 ${username} 进入前端演示模式`);
      saveData(data);

      return {
        token: `demo-token-${user.id}-${Date.now()}`,
        user: sanitizeUser(user)
      };
    },

    getMe() {
      const user = requireUser();
      const data = getData();
      const fresh = data.users.find((item) => item.id === user.id || item.username === user.username);
      return sanitizeUser(fresh || user);
    },

    getUsers() {
      const data = getData();
      return {
        teachers: clone(data.teachers),
        students: clone(data.students)
      };
    },

    getStudents() {
      return clone(getData().students);
    },

    getTeachers() {
      return clone(getData().teachers);
    },

    getTopics() {
      return clone(getData().topics);
    },

    addTopic(topic) {
      const user = requireUser();
      if (!["admin", "teacher"].includes(user.role)) {
        throw new Error("当前角色不能发布课题。");
      }

      const data = getData();
      const teacherId = user.role === "teacher" ? user.teacherId : topic.teacherId;
      const teacher = findTeacher(data, teacherId);
      if (!teacher) throw new Error("未找到教师信息。");

      const newTopic = {
        id: nextId("TP", data.topics),
        title: topic.title,
        teacherId: teacher.id,
        teacherName: teacher.name,
        major: topic.major,
        quota: Number(topic.quota) || 1,
        selectedCount: 0,
        status: "可选",
        description: topic.description || ""
      };

      data.topics.unshift(newTopic);
      addOperationLog(data, user, "发布课题", `发布课题：${newTopic.title}`);
      saveData(data);
      return clone(newTopic);
    },

    applyTopic(topicId) {
      const user = requireUser();
      if (user.role !== "student") throw new Error("只有学生可以提交选题申请。");

      const data = getData();
      const student = findStudent(data, user.studentId);
      const topic = findTopic(data, topicId);
      if (!student) throw new Error("未找到学生信息。");
      if (!topic) throw new Error("课题不存在。");
      if (topic.status !== "可选") throw new Error("该课题当前不可申请。");

      const existingForTopic = data.applications.find(
        (item) => item.studentId === student.id && item.topicId === topic.id && item.status !== "已拒绝"
      );
      if (existingForTopic) throw new Error("你已经提交过该课题申请。");

      const activeApplication = data.applications.find(
        (item) => item.studentId === student.id && ["待审核", "已通过"].includes(item.status)
      );
      if (activeApplication) throw new Error("你已有有效选题申请，请等待审核或查看结果。");

      const application = {
        id: nextId("A", data.applications),
        studentId: student.id,
        studentName: student.name,
        topicId: topic.id,
        topicTitle: topic.title,
        teacherId: topic.teacherId,
        teacherName: topic.teacherName,
        status: "待审核",
        applyDate: today(),
        reviewDate: "",
        comment: ""
      };

      data.applications.unshift(application);
      addOperationLog(data, user, "提交选题申请", `申请课题：${topic.title}`);
      saveData(data);
      return clone(application);
    },

    getApplications() {
      const user = requireUser();
      return clone(visibleForRole(getData().applications, user));
    },

    approveApplication(applicationId, comment = "审核通过。") {
      const user = requireUser();
      const data = getData();
      const application = data.applications.find((item) => item.id === applicationId);
      if (!application) throw new Error("未找到选题申请。");
      if (user.role === "teacher" && application.teacherId !== user.teacherId) {
        throw new Error("只能审核自己课题相关的申请。");
      }
      if (!["admin", "teacher"].includes(user.role)) {
        throw new Error("当前角色不能审核选题申请。");
      }

      const wasApproved = application.status === "已通过";
      application.status = "已通过";
      application.reviewDate = today();
      application.comment = comment;

      const topic = findTopic(data, application.topicId);
      if (topic && !wasApproved) {
        topic.selectedCount = Math.min(topic.quota, (topic.selectedCount || 0) + 1);
        topic.status = topic.selectedCount >= topic.quota ? "已被选择" : "可选";
      }

      ensureAdvisorAssignment(data, application);
      ensureProcessTasks(data, application);
      ensureMaterials(data, application);
      addReviewRecord(data, "选题申请", application.id, user, "已通过", comment);
      addOperationLog(data, user, "审核选题申请", `通过 ${application.studentName} 的选题申请`);
      saveData(data);
      return clone(application);
    },

    rejectApplication(applicationId, comment = "请调整选题方向后重新申请。") {
      const user = requireUser();
      const data = getData();
      const application = data.applications.find((item) => item.id === applicationId);
      if (!application) throw new Error("未找到选题申请。");
      if (user.role === "teacher" && application.teacherId !== user.teacherId) {
        throw new Error("只能审核自己课题相关的申请。");
      }
      if (!["admin", "teacher"].includes(user.role)) {
        throw new Error("当前角色不能审核选题申请。");
      }

      application.status = "已拒绝";
      application.reviewDate = today();
      application.comment = comment;
      addReviewRecord(data, "选题申请", application.id, user, "已拒绝", comment);
      addOperationLog(data, user, "审核选题申请", `拒绝 ${application.studentName} 的选题申请`);
      saveData(data);
      return clone(application);
    },

    getMaterials() {
      const user = requireUser();
      return clone(visibleForRole(getData().materials, user));
    },

    submitMaterial(material) {
      const user = requireUser();
      if (user.role !== "student") throw new Error("只有学生可以提交材料。");

      const data = getData();
      const student = findStudent(data, user.studentId);
      const application = approvedApplication(data, user.studentId);
      if (!student) throw new Error("未找到学生信息。");
      if (!application) throw new Error("只有选题审核通过后才能提交材料。");

      let record = data.materials.find(
        (item) => item.studentId === student.id && item.type === material.type
      );

      if (!record) {
        record = {
          id: nextId("M", data.materials),
          studentId: student.id,
          studentName: student.name,
          topicId: application.topicId,
          topicTitle: application.topicTitle,
          teacherId: application.teacherId,
          teacherName: application.teacherName,
          type: material.type,
          title: "",
          fileName: "",
          status: "未提交",
          submitDate: "",
          reviewDate: "",
          reviewComment: ""
        };
        data.materials.push(record);
      }

      record.title = material.title || `${material.type}材料`;
      record.fileName = material.fileName || `${material.type}.docx`;
      record.status = "待审核";
      record.submitDate = today();
      record.reviewDate = "";
      record.reviewComment = "";
      updateTaskFromMaterial(data, record);
      syncPaperSubmission(data, record);
      addOperationLog(data, user, "提交论文材料", `${record.type}：${record.fileName}`);
      saveData(data);
      return clone(record);
    },

    reviewMaterial(materialId, status, reviewComment) {
      const user = requireUser();
      if (!["admin", "teacher"].includes(user.role)) throw new Error("当前角色不能审核材料。");

      const data = getData();
      const material = data.materials.find((item) => item.id === materialId);
      if (!material) throw new Error("未找到材料记录。");
      if (user.role === "teacher" && material.teacherId !== user.teacherId) {
        throw new Error("只能审核自己指导学生的材料。");
      }

      material.status = status;
      material.reviewDate = today();
      material.reviewComment =
        reviewComment || (status === "已通过" ? "材料通过。" : "请修改后重新提交。");
      updateTaskFromMaterial(data, material);
      syncPaperSubmission(data, material);
      addReviewRecord(data, material.type, material.id, user, status, material.reviewComment);
      addOperationLog(data, user, "审核论文材料", `${material.studentName} 的${material.type}：${status}`);
      saveData(data);
      return clone(material);
    },

    getDefenseArrangements() {
      const user = requireUser();
      return clone(visibleForRole(getData().defenseArrangements, user));
    },

    addDefenseArrangement(arrangement) {
      const user = requireUser();
      if (user.role !== "admin") throw new Error("只有管理员可以安排答辩。");

      const data = getData();
      const student = findStudent(data, arrangement.studentId);
      const application = approvedApplication(data, arrangement.studentId);
      if (!student) throw new Error("未找到学生信息。");
      if (!application) throw new Error("该学生尚无已通过的选题。");

      let record = data.defenseArrangements.find((item) => item.studentId === student.id);
      if (!record) {
        record = {
          id: nextId("D", data.defenseArrangements),
          studentId: student.id,
          studentName: student.name,
          topicId: application.topicId,
          topicTitle: application.topicTitle,
          teacherId: application.teacherId,
          teacherName: application.teacherName,
          time: "",
          place: "",
          group: "",
          chair: "",
          status: "已安排"
        };
        data.defenseArrangements.unshift(record);
      }

      record.time = arrangement.time;
      record.place = arrangement.place;
      record.group = arrangement.group;
      record.chair = arrangement.chair;
      record.status = "已安排";

      addOperationLog(data, user, "安排答辩", `${student.name}：${record.time} ${record.place}`);
      saveData(data);
      return clone(record);
    },

    getGrades() {
      const user = requireUser();
      return clone(visibleForRole(getData().grades, user));
    },

    addGrade(grade) {
      const user = requireUser();
      if (user.role !== "admin") throw new Error("只有管理员可以录入成绩。");

      const data = getData();
      const student = findStudent(data, grade.studentId);
      const application = approvedApplication(data, grade.studentId);
      if (!student) throw new Error("未找到学生信息。");
      if (!application) throw new Error("该学生尚无已通过的选题。");

      const tutorScore = Number(grade.tutorScore);
      const defenseScore = Number(grade.defenseScore);
      if (Number.isNaN(tutorScore) || Number.isNaN(defenseScore)) {
        throw new Error("指导评分和答辩评分必须是数字。");
      }

      const finalScore = Math.round(tutorScore * 0.4 + defenseScore * 0.6);
      let record = data.grades.find((item) => item.studentId === student.id);
      if (!record) {
        record = {
          id: nextId("G", data.grades),
          studentId: student.id,
          studentName: student.name,
          topicId: application.topicId,
          topicTitle: application.topicTitle,
          teacherId: application.teacherId,
          teacherName: application.teacherName,
          tutorScore: 0,
          defenseScore: 0,
          finalScore: 0,
          passed: false,
          status: "未通过",
          remark: ""
        };
        data.grades.unshift(record);
      }

      record.tutorScore = tutorScore;
      record.defenseScore = defenseScore;
      record.finalScore = finalScore;
      record.passed = finalScore >= 60;
      record.status = record.passed ? "已通过" : "未通过";
      record.remark = grade.remark || "";

      addReviewRecord(data, "成绩评定", record.id, user, record.status, record.remark);
      addOperationLog(data, user, "录入成绩", `${student.name} 最终成绩 ${finalScore} 分`);
      saveData(data);
      return clone(record);
    },

    getArchives() {
      const user = requireUser();
      return clone(visibleForRole(getData().archives, user));
    },

    addArchive(archive) {
      const user = requireUser();
      if (user.role !== "admin") throw new Error("只有管理员可以完成论文归档。");

      const data = getData();
      const student = findStudent(data, archive.studentId);
      const grade = data.grades.find((item) => item.studentId === archive.studentId && item.passed);
      if (!student) throw new Error("未找到学生信息。");
      if (!grade) throw new Error("该学生尚无通过成绩，不能归档。");

      let record = data.archives.find((item) => item.studentId === student.id);
      if (!record) {
        record = {
          id: nextId("AR", data.archives),
          studentId: student.id,
          studentName: student.name,
          topicId: grade.topicId,
          topicTitle: grade.topicTitle,
          teacherId: grade.teacherId,
          teacherName: grade.teacherName,
          archiveDate: "",
          status: "未归档",
          location: "",
          note: ""
        };
        data.archives.unshift(record);
      }

      record.archiveDate = archive.archiveDate || today();
      record.status = "已归档";
      record.location = archive.location;
      record.note = archive.note || "";

      addOperationLog(data, user, "完成论文归档", `${student.name}：${record.location}`);
      saveData(data);
      return clone(record);
    },

    getDashboardStats() {
      const user = requireUser();
      const data = getData();
      const topics =
        user.role === "teacher"
          ? data.topics.filter((item) => item.teacherId === user.teacherId)
          : data.topics;
      const applications = visibleForRole(data.applications, user);
      const materials = visibleForRole(data.materials, user);
      const defenses = visibleForRole(data.defenseArrangements, user);
      const archives = visibleForRole(data.archives, user);

      return {
        topicCount: topics.length,
        selectedStudentCount: new Set(
          applications.filter((item) => item.status === "已通过").map((item) => item.studentId)
        ).size,
        pendingMaterialCount: materials.filter((item) => item.status === "待审核").length,
        arrangedDefenseCount: defenses.length,
        archivedCount: archives.filter((item) => item.status === "已归档").length
      };
    }
  };

  window.ThesisDemoAPI = ThesisDemoAPI;

  initFromUrl();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderBanner);
  } else {
    renderBanner();
  }
  window.addEventListener("demo-mode-change", renderBanner);
})();
