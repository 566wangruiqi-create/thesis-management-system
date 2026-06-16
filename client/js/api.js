(function () {
  const STORAGE_KEY = "thesis_mock_data";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
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

    getTopics() {
      return clone(getData().topics);
    },

    addTopic(topic) {
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

    applyTopic(topicId, studentId) {
      const data = getData();
      const topic = getTopicById(data, topicId);
      const student = findStudent(data, studentId);

      if (!topic || topic.status !== "可选") {
        throw new Error("该课题当前不可申请。");
      }
      if (!student) {
        throw new Error("未找到学生信息。");
      }

      const duplicate = data.applications.find(
        (item) =>
          item.studentId === studentId &&
          item.topicId === topicId &&
          item.status !== "已拒绝"
      );
      if (duplicate) {
        throw new Error("你已经提交过该课题申请。");
      }

      const application = {
        id: nextId("A", data.applications),
        studentId,
        studentName: student.name,
        topicId,
        topicTitle: topic.title,
        teacherId: topic.teacherId,
        teacherName: topic.teacherName,
        status: "待审核",
        applyDate: today(),
        reviewDate: "",
        comment: ""
      };
      data.applications.unshift(application);
      saveData(data);
      return clone(application);
    },

    getApplications() {
      return clone(getData().applications);
    },

    approveApplication(applicationId, comment = "审核通过。") {
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

    rejectApplication(applicationId, comment = "请调整选题方向后重新申请。") {
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

    submitMaterial(material) {
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

    reviewMaterial(materialId, status, reviewComment) {
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

    getDefenseArrangements() {
      return clone(getData().defenseArrangements);
    },

    addDefenseArrangement(arrangement) {
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

    getGrades() {
      return clone(getData().grades);
    },

    addGrade(grade) {
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

    getArchives() {
      return clone(getData().archives);
    },

    addArchive(archive) {
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
