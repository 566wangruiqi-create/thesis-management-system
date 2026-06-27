(function () {
  const API_BASE_URL = "http://localhost:3000/api";
  const TOKEN_KEY = "thesis_auth_token";
  const USER_KEY = "thesis_current_user";
  const REQUEST_TIMEOUT = 4000;

  function demoApi() {
    return window.ThesisDemoAPI;
  }

  function demoAvailable() {
    return Boolean(demoApi());
  }

  function isDemoMode() {
    return demoAvailable() && demoApi().isDemoMode();
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
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

  function unavailableError(message, cause) {
    const error = new Error(message || "真实 API 不可用");
    error.apiUnavailable = true;
    error.cause = cause;
    return error;
  }

  async function request(path, options = {}) {
    const token = getToken();
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal
      });
    } catch (error) {
      throw unavailableError("真实 API 无法连接", error);
    } finally {
      window.clearTimeout(timer);
    }

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

    if (response.status >= 500) {
      throw unavailableError((result && result.message) || "真实 API 服务异常");
    }

    if (!response.ok || (result && result.success === false)) {
      throw new Error((result && result.message) || "请求失败");
    }

    return result ? result.data : null;
  }

  async function withFallback(realAction, demoAction) {
    if (isDemoMode()) {
      return demoAction();
    }

    try {
      return await realAction();
    } catch (error) {
      if (error.apiUnavailable && demoAvailable()) {
        demoApi().activate("真实 API 不可用，已自动切换到前端演示模式");
        return demoAction();
      }
      throw error;
    }
  }

  function runDemo(methodName, ...args) {
    const api = demoApi();
    if (!api || typeof api[methodName] !== "function") {
      throw new Error("演示 API 未加载。");
    }
    return api[methodName](...args);
  }

  const ThesisAPI = {
    API_BASE_URL,

    isDemoMode,

    enableDemoMode(reason) {
      runDemo("activate", reason);
    },

    resetDemoData() {
      return runDemo("resetDemoData");
    },

    resetMockData() {
      return this.resetDemoData();
    },

    getAllData() {
      return runDemo("getAllData");
    },

    async login(username, password) {
      return withFallback(
        async () => {
          const data = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
          });

          return {
            token: data.token,
            user: normalizeUser(data.user)
          };
        },
        () => {
          const data = runDemo("login", username, password);
          return {
            token: data.token,
            user: normalizeUser(data.user)
          };
        }
      );
    },

    async getMe() {
      return withFallback(
        async () => normalizeUser(await request("/auth/me")),
        () => normalizeUser(runDemo("getMe"))
      );
    },

    async getTopics() {
      return withFallback(
        async () => (await request("/topics")).map(normalizeTopic),
        () => runDemo("getTopics").map(normalizeTopic)
      );
    },

    async addTopic(topic) {
      return withFallback(
        async () => {
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
        () => normalizeTopic(runDemo("addTopic", topic))
      );
    },

    async applyTopic(topicId) {
      return withFallback(
        () =>
          request("/applications", {
            method: "POST",
            body: JSON.stringify({ topic_id: topicId })
          }),
        () => runDemo("applyTopic", topicId)
      );
    },

    async getApplications() {
      return withFallback(
        async () => (await request("/applications")).map(normalizeApplication),
        () => runDemo("getApplications").map(normalizeApplication)
      );
    },

    async getApplicationsFromServer() {
      return this.getApplications();
    },

    async approveApplication(applicationId, comment = "审核通过。") {
      return withFallback(
        () =>
          request(`/applications/${applicationId}/approve`, {
            method: "PUT",
            body: JSON.stringify({ comment })
          }),
        () => runDemo("approveApplication", applicationId, comment)
      );
    },

    async rejectApplication(applicationId, comment = "请调整选题方向后重新申请。") {
      return withFallback(
        () =>
          request(`/applications/${applicationId}/reject`, {
            method: "PUT",
            body: JSON.stringify({ comment })
          }),
        () => runDemo("rejectApplication", applicationId, comment)
      );
    },

    async getMaterials() {
      return withFallback(
        async () => (await request("/materials")).map(normalizeMaterial),
        () => runDemo("getMaterials").map(normalizeMaterial)
      );
    },

    async getMaterialsFromServer() {
      return this.getMaterials();
    },

    async submitMaterial(material) {
      return withFallback(
        () =>
          request("/materials", {
            method: "POST",
            body: JSON.stringify({
              type: material.type,
              title: material.title,
              file_name: material.fileName
            })
          }),
        () => runDemo("submitMaterial", material)
      );
    },

    async reviewMaterial(materialId, status, reviewComment) {
      return withFallback(
        () =>
          request(`/materials/${materialId}/review`, {
            method: "PUT",
            body: JSON.stringify({
              status,
              review_comment: reviewComment
            })
          }),
        () => runDemo("reviewMaterial", materialId, status, reviewComment)
      );
    },

    async getDefenseArrangements() {
      return withFallback(
        async () => (await request("/defenses")).map(normalizeDefense),
        () => runDemo("getDefenseArrangements").map(normalizeDefense)
      );
    },

    async addDefenseArrangement(arrangement) {
      return withFallback(
        () =>
          request("/defenses", {
            method: "POST",
            body: JSON.stringify({
              student_id: arrangement.studentId,
              defense_time: arrangement.time,
              place: arrangement.place,
              defense_group: arrangement.group,
              chair: arrangement.chair
            })
          }),
        () => runDemo("addDefenseArrangement", arrangement)
      );
    },

    async getGrades() {
      return withFallback(
        async () => (await request("/grades")).map(normalizeGrade),
        () => runDemo("getGrades").map(normalizeGrade)
      );
    },

    async addGrade(grade) {
      return withFallback(
        () =>
          request("/grades", {
            method: "POST",
            body: JSON.stringify({
              student_id: grade.studentId,
              tutor_score: grade.tutorScore,
              defense_score: grade.defenseScore,
              remark: grade.remark
            })
          }),
        () => runDemo("addGrade", grade)
      );
    },

    async getArchives() {
      return withFallback(
        async () => (await request("/archives")).map(normalizeArchive),
        () => runDemo("getArchives").map(normalizeArchive)
      );
    },

    async addArchive(archive) {
      return withFallback(
        () =>
          request("/archives", {
            method: "POST",
            body: JSON.stringify({
              student_id: archive.studentId,
              archive_date: archive.archiveDate,
              location: archive.location,
              note: archive.note
            })
          }),
        () => runDemo("addArchive", archive)
      );
    },

    async getUsers() {
      return withFallback(
        async () => {
          const users = await request("/users");
          return {
            teachers: users.teachers || [],
            students: (users.students || []).map(normalizeStudent)
          };
        },
        () => {
          const users = runDemo("getUsers");
          return {
            teachers: users.teachers || [],
            students: (users.students || []).map(normalizeStudent)
          };
        }
      );
    },

    async getUsersFromServer() {
      return this.getUsers();
    },

    async getTeachers() {
      const users = await this.getUsers();
      return users.teachers;
    },

    async getStudents() {
      const users = await this.getUsers();
      return users.students;
    },

    async getDashboardStats() {
      return withFallback(
        async () => {
          const [topics, applications, materials, defenses, archives] = await Promise.all([
            this.getTopics(),
            this.getApplications(),
            this.getMaterials(),
            this.getDefenseArrangements(),
            this.getArchives()
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
        () => runDemo("getDashboardStats")
      );
    },

    async getDashboardStatsFromServer() {
      return this.getDashboardStats();
    },

    async getMockTopics() {
      return runDemo("getTopics").map(normalizeTopic);
    },

    async getMockDefenseArrangements() {
      return runDemo("getDefenseArrangements").map(normalizeDefense);
    },

    async getMockGrades() {
      return runDemo("getGrades").map(normalizeGrade);
    },

    async getMockArchives() {
      return runDemo("getArchives").map(normalizeArchive);
    }
  };

  window.ThesisAPI = ThesisAPI;
})();
