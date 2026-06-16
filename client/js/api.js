(function () {
  const API_BASE_URL = "http://localhost:3000/api";
  const TOKEN_KEY = "thesis_auth_token";
  const USER_KEY = "thesis_current_user";
  const STORAGE_KEY = "thesis_mock_data";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(value) {
    if (!value) return "";
    if (!String(value).includes("T")) return String(value);

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDateTime(value) {
    if (!value) return "";
    if (!String(value).includes("T")) return String(value);

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 16).replace("T", " ");

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  async function request(path, options = {}) {
    const token = getToken();
    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    let result = null;
    try {
      result = await response.json();
    } catch (error) {
      result = null;
    }

    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    if (!response.ok || (result && result.success === false)) {
      throw new Error((result && result.message) || "请求失败");
    }

    return result ? result.data : null;
  }

  function normalizeUser(user) {
    if (!user) return null;
    return {
      ...user,
      roleName: user.roleName || user.role_name,
      teacherId: user.teacherId || user.teacher_id || "",
      studentId: user.studentId || user.student_id || ""
    };
  }

  function normalizeTopic(topic) {
    return {
      ...topic,
      teacherId: topic.teacherId || topic.teacher_id,
      teacherName: topic.teacherName || topic.teacher_name,
      selectedCount: topic.selectedCount ?? topic.selected_count ?? 0
    };
  }

  function normalizeApplication(item) {
    return {
      ...item,
      studentId: item.studentId || item.student_id,
      studentName: item.studentName || item.student_name,
      topicId: item.topicId || item.topic_id,
      topicTitle: item.topicTitle || item.topic_title,
      teacherId: item.teacherId || item.teacher_id,
      teacherName: item.teacherName || item.teacher_name,
      applyDate: formatDate(item.applyDate || item.apply_date),
      reviewDate: formatDate(item.reviewDate || item.review_date)
    };
  }

  function normalizeMaterial(item) {
    return {
      ...item,
      studentId: item.studentId || item.student_id,
      studentName: item.studentName || item.student_name,
      topicId: item.topicId || item.topic_id,
      topicTitle: item.topicTitle || item.topic_title,
      teacherId: item.teacherId || item.teacher_id,
      teacherName: item.teacherName || item.teacher_name,
      fileName: item.fileName || item.file_name,
      submitDate: formatDate(item.submitDate || item.submit_date),
      reviewDate: formatDate(item.reviewDate || item.review_date),
      reviewComment: item.reviewComment || item.review_comment || "",
      status: item.status
    };
  }

  function normalizeDefense(item) {
    return {
      ...item,
      studentId: item.studentId || item.student_id,
      studentName: item.studentName || item.student_name,
      topicId: item.topicId || item.topic_id,
      topicTitle: item.topicTitle || item.topic_title,
      teacherId: item.teacherId || item.teacher_id,
      teacherName: item.teacherName || item.teacher_name,
      time: formatDateTime(item.time || item.defense_time),
      group: item.group || item.defense_group || "",
      status: item.status
    };
  }

  function normalizeGrade(item) {
    return {
      ...item,
      studentId: item.studentId || item.student_id,
      studentName: item.studentName || item.student_name,
      topicId: item.topicId || item.topic_id,
      topicTitle: item.topicTitle || item.topic_title,
      teacherId: item.teacherId || item.teacher_id,
      teacherName: item.teacherName || item.teacher_name,
      tutorScore: item.tutorScore ?? item.tutor_score,
      defenseScore: item.defenseScore ?? item.defense_score,
      finalScore: item.finalScore ?? item.final_score,
      passed: Boolean(item.passed),
      status: item.status
    };
  }

  function normalizeArchive(item) {
    return {
      ...item,
      studentId: item.studentId || item.student_id,
      studentName: item.studentName || item.student_name,
      topicId: item.topicId || item.topic_id,
      topicTitle: item.topicTitle || item.topic_title,
      teacherId: item.teacherId || item.teacher_id,
      teacherName: item.teacherName || item.teacher_name,
      archiveDate: formatDate(item.archiveDate || item.archive_date),
      status: item.status
    };
  }

  function normalizeStudent(student) {
    return {
      ...student,
      className: student.className || student.class_name
    };
  }

  function getData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = clone(window.MOCK_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(raw);
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

  function getApprovedApplication(data, studentId) {
    return data.applications.find(
      (item) => item.studentId === studentId && item.status === "已通过"
    );
  }

  function getTopicById(data, topicId) {
    return data.topics.find((topic) => topic.id === topicId);
  }

  const ThesisAPI = {
    API_BASE_URL,

    async login(username, password) {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      return {
        token: data.token,
        user: normalizeUser(data.user)
      };
    },

    async getMe() {
      return normalizeUser(await request("/auth/me"));
    },

    async getTopics() {
      const topics = await request("/topics");
      return topics.map(normalizeTopic);
    },

    async addTopic(topic) {
      const data = await request("/topics", {
        method: "POST",
        body: JSON.stringify({
          title: topic.title,
          major: topic.major,
          quota: topic.quota,
          description: topic.description,
          teacher_id: topic.teacherId
        })
      });
      return normalizeTopic(data);
    },

    async applyTopic(topicId) {
      return request("/applications", {
        method: "POST",
        body: JSON.stringify({ topic_id: topicId })
      });
    },

    async getApplicationsFromServer() {
      const applications = await request("/applications");
      return applications.map(normalizeApplication);
    },

    async approveApplication(applicationId, comment = "审核通过。") {
      return request(`/applications/${applicationId}/approve`, {
        method: "PUT",
        body: JSON.stringify({ comment })
      });
    },

    async rejectApplication(applicationId, comment = "请调整选题方向后重新申请。") {
      return request(`/applications/${applicationId}/reject`, {
        method: "PUT",
        body: JSON.stringify({ comment })
      });
    },

    async getMaterialsFromServer() {
      const materials = await request("/materials");
      return materials.map(normalizeMaterial);
    },

    async submitMaterial(material) {
      const data = await request("/materials", {
        method: "POST",
        body: JSON.stringify({
          type: material.type,
          title: material.title,
          file_name: material.fileName
        })
      });
      return data;
    },

    async reviewMaterial(materialId, status, reviewComment) {
      return request(`/materials/${materialId}/review`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          review_comment: reviewComment
        })
      });
    },

    async getDefenseArrangements() {
      const defenses = await request("/defenses");
      return defenses.map(normalizeDefense);
    },

    async addDefenseArrangement(arrangement) {
      return request("/defenses", {
        method: "POST",
        body: JSON.stringify({
          student_id: arrangement.studentId,
          defense_time: arrangement.time,
          place: arrangement.place,
          defense_group: arrangement.group,
          chair: arrangement.chair
        })
      });
    },

    async getGrades() {
      const grades = await request("/grades");
      return grades.map(normalizeGrade);
    },

    async addGrade(grade) {
      return request("/grades", {
        method: "POST",
        body: JSON.stringify({
          student_id: grade.studentId,
          tutor_score: grade.tutorScore,
          defense_score: grade.defenseScore,
          remark: grade.remark
        })
      });
    },

    async getArchives() {
      const archives = await request("/archives");
      return archives.map(normalizeArchive);
    },

    async addArchive(archive) {
      return request("/archives", {
        method: "POST",
        body: JSON.stringify({
          student_id: archive.studentId,
          archive_date: archive.archiveDate,
          location: archive.location,
          note: archive.note
        })
      });
    },

    async getUsersFromServer() {
      const users = await request("/users");
      return {
        teachers: users.teachers || [],
        students: (users.students || []).map(normalizeStudent)
      };
    },

    async getDashboardStatsFromServer() {
      const [topics, applications, materials, defenses, archives] = await Promise.all([
        this.getTopics(),
        this.getApplicationsFromServer(),
        request("/materials").then((items) => items.map(normalizeMaterial)),
        request("/defenses").then((items) => items.map(normalizeDefense)),
        request("/archives").then((items) => items.map(normalizeArchive))
      ]);

      return {
        topicCount: topics.length,
        selectedStudentCount: new Set(
          applications.filter((item) => item.status === "已通过").map((item) => item.studentId)
        ).size,
        pendingMaterialCount: materials.filter((item) => item.status === "待审核").length,
        arrangedDefenseCount: defenses.length,
        archivedCount: archives.filter((item) => item.status === "已归档").length
      };
    },

    resetMockData() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clone(window.MOCK_DATA)));
    },

    getAllData() {
      return clone(getData());
    },

    getUsers() {
      return getData().users.map(({ password, ...user }) => user);
    },

    getStudents() {
      return clone(getData().students);
    },

    getTeachers() {
      return clone(getData().teachers);
    },

    getMockTopics() {
      return clone(getData().topics);
    },

    addMockTopic(topic) {
      const data = getData();
      const teacher = findTeacher(data, topic.teacherId);
      const newTopic = {
        id: nextId("TP", data.topics),
        title: topic.title,
        teacherId: topic.teacherId,
        teacherName: teacher ? teacher.name : topic.teacherName,
        major: topic.major,
        quota: Number(topic.quota) || 1,
        selectedCount: 0,
        status: "可选",
        description: topic.description || ""
      };
      data.topics.unshift(newTopic);
      saveData(data);
      return clone(newTopic);
    },

    getApplications() {
      return clone(getData().applications);
    },

    approveMockApplication(applicationId, comment = "审核通过。") {
      const data = getData();
      const application = data.applications.find((item) => item.id === applicationId);
      if (!application) {
        throw new Error("未找到选题申请。");
      }

      const wasApproved = application.status === "已通过";
      application.status = "已通过";
      application.reviewDate = today();
      application.comment = comment;

      const topic = getTopicById(data, application.topicId);
      if (topic && !wasApproved) {
        topic.selectedCount = Math.min(topic.quota, (topic.selectedCount || 0) + 1);
        if (topic.selectedCount >= topic.quota) {
          topic.status = "已被选择";
        }
      }

      ["开题报告", "中期检查", "论文终稿"].forEach((type) => {
        const exists = data.materials.some(
          (item) => item.studentId === application.studentId && item.type === type
        );
        if (!exists) {
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
        }
      });

      saveData(data);
      return clone(application);
    },

    rejectMockApplication(applicationId, comment = "请调整选题方向后重新申请。") {
      const data = getData();
      const application = data.applications.find((item) => item.id === applicationId);
      if (!application) {
        throw new Error("未找到选题申请。");
      }
      application.status = "已拒绝";
      application.reviewDate = today();
      application.comment = comment;
      saveData(data);
      return clone(application);
    },

    getMaterials() {
      return clone(getData().materials);
    },

    submitMockMaterial(material) {
      const data = getData();
      const student = findStudent(data, material.studentId);
      const approved = getApprovedApplication(data, material.studentId);
      if (!student) {
        throw new Error("未找到学生信息。");
      }

      let record = data.materials.find(
        (item) => item.studentId === material.studentId && item.type === material.type
      );

      if (!record) {
        record = {
          id: nextId("M", data.materials),
          studentId: material.studentId,
          studentName: student.name,
          topicId: approved ? approved.topicId : "",
          topicTitle: approved ? approved.topicTitle : "暂未通过选题",
          teacherId: approved ? approved.teacherId : "",
          teacherName: approved ? approved.teacherName : "",
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

      saveData(data);
      return clone(record);
    },

    reviewMockMaterial(materialId, status, reviewComment) {
      const data = getData();
      const material = data.materials.find((item) => item.id === materialId);
      if (!material) {
        throw new Error("未找到材料记录。");
      }
      material.status = status;
      material.reviewDate = today();
      material.reviewComment = reviewComment || (status === "已通过" ? "材料通过。" : "请修改后重新提交。");
      saveData(data);
      return clone(material);
    },

    getMockDefenseArrangements() {
      return clone(getData().defenseArrangements);
    },

    addMockDefenseArrangement(arrangement) {
      const data = getData();
      const student = findStudent(data, arrangement.studentId);
      const approved = getApprovedApplication(data, arrangement.studentId);
      if (!student) {
        throw new Error("未找到学生信息。");
      }

      let record = data.defenseArrangements.find(
        (item) => item.studentId === arrangement.studentId
      );

      if (!record) {
        record = {
          id: nextId("D", data.defenseArrangements),
          studentId: student.id,
          studentName: student.name,
          teacherId: approved ? approved.teacherId : "",
          teacherName: approved ? approved.teacherName : "",
          topicTitle: approved ? approved.topicTitle : "暂未通过选题",
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

      saveData(data);
      return clone(record);
    },

    getMockGrades() {
      return clone(getData().grades);
    },

    addMockGrade(grade) {
      const data = getData();
      const student = findStudent(data, grade.studentId);
      const approved = getApprovedApplication(data, grade.studentId);
      if (!student) {
        throw new Error("未找到学生信息。");
      }

      const tutorScore = Number(grade.tutorScore) || 0;
      const defenseScore = Number(grade.defenseScore) || 0;
      const finalScore = Math.round(tutorScore * 0.4 + defenseScore * 0.6);
      let record = data.grades.find((item) => item.studentId === grade.studentId);

      if (!record) {
        record = {
          id: nextId("G", data.grades),
          studentId: student.id,
          studentName: student.name,
          teacherId: approved ? approved.teacherId : "",
          teacherName: approved ? approved.teacherName : "",
          topicTitle: approved ? approved.topicTitle : "暂未通过选题",
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

      saveData(data);
      return clone(record);
    },

    getMockArchives() {
      return clone(getData().archives);
    },

    addMockArchive(archive) {
      const data = getData();
      const student = findStudent(data, archive.studentId);
      const approved = getApprovedApplication(data, archive.studentId);
      if (!student) {
        throw new Error("未找到学生信息。");
      }

      let record = data.archives.find((item) => item.studentId === archive.studentId);
      if (!record) {
        record = {
          id: nextId("AR", data.archives),
          studentId: student.id,
          studentName: student.name,
          teacherId: approved ? approved.teacherId : "",
          teacherName: approved ? approved.teacherName : "",
          topicTitle: approved ? approved.topicTitle : "暂未通过选题",
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

      saveData(data);
      return clone(record);
    },

    getDashboardStats() {
      const data = getData();
      return {
        topicCount: data.topics.length,
        selectedStudentCount: new Set(
          data.applications
            .filter((item) => item.status === "已通过")
            .map((item) => item.studentId)
        ).size,
        pendingMaterialCount: data.materials.filter((item) => item.status === "待审核").length,
        arrangedDefenseCount: data.defenseArrangements.length,
        archivedCount: data.archives.filter((item) => item.status === "已归档").length
      };
    }
  };

  window.ThesisAPI = ThesisAPI;
})();
