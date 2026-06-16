(async function () {
  const user = AppAuth.renderShell("grades", userTitle());
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("grades", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const formPanel = document.querySelector("#gradeFormPanel");
  const form = document.querySelector("#gradeForm");
  const studentSelect = document.querySelector("#gradeStudent");
  const tbody = document.querySelector("#gradesTable");
  const subtitle = document.querySelector("#gradesSubtitle");

  if (user.role === "admin") {
    formPanel.classList.remove("hidden");
    subtitle.textContent = "录入指导教师评分、答辩评分并自动计算最终成绩。";
    await fillStudentOptions();
  } else if (user.role === "student") {
    formPanel.classList.add("hidden");
    subtitle.textContent = "查看自己的最终成绩和是否通过。";
  } else {
    formPanel.classList.add("hidden");
    subtitle.textContent = "查看自己指导学生的成绩。";
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      try {
        await ThesisAPI.addGrade({
          studentId: formData.get("studentId"),
          tutorScore: formData.get("tutorScore"),
          defenseScore: formData.get("defenseScore"),
          remark: formData.get("remark").trim()
        });
        form.reset();
        await fillStudentOptions();
        AppUI.toast("成绩已保存。");
        await renderGrades();
      } catch (error) {
        AppUI.toast(error.message);
      }
    });
  }

  function userTitle() {
    const current = AppAuth.getCurrentUser();
    if (current && current.role === "student") return "我的成绩";
    if (current && current.role === "teacher") return "成绩查看";
    return "成绩管理";
  }

  async function fillStudentOptions() {
    if (!studentSelect) return;

    let approved = [];
    try {
      approved = (await ThesisAPI.getApplicationsFromServer()).filter((item) => item.status === "已通过");
    } catch (error) {
      AppUI.toast(`学生选项暂用本地备用数据：${error.message}`);
      approved = ThesisAPI.getApplications().filter((item) => item.status === "已通过");
    }

    studentSelect.innerHTML =
      approved.length === 0
        ? `<option value="">暂无可录入成绩学生</option>`
        : approved
            .map(
              (item) =>
                `<option value="${item.studentId}">${AppUI.escapeHtml(item.studentName)} - ${AppUI.escapeHtml(item.topicTitle)}</option>`
            )
            .join("");
  }

  async function getVisibleGrades() {
    try {
      return await ThesisAPI.getGrades();
    } catch (error) {
      AppUI.toast(`成绩记录暂用本地备用数据：${error.message}`);
      return ThesisAPI.getMockGrades().filter((item) => {
        if (user.role === "teacher") return item.teacherId === user.teacherId;
        if (user.role === "student") return item.studentId === user.studentId;
        return true;
      });
    }
  }

  async function renderGrades() {
    tbody.innerHTML = AppUI.emptyRow(8, "正在加载成绩记录");

    const grades = await getVisibleGrades();
    tbody.innerHTML =
      grades.length === 0
        ? AppUI.emptyRow(8, "暂无成绩记录")
        : grades
            .map(
              (item) => `
                <tr>
                  <td>${AppUI.escapeHtml(item.studentName)}</td>
                  <td>${AppUI.escapeHtml(item.topicTitle)}</td>
                  <td>${AppUI.escapeHtml(item.teacherName)}</td>
                  <td>${item.tutorScore}</td>
                  <td>${item.defenseScore}</td>
                  <td><strong>${item.finalScore}</strong></td>
                  <td>${AppUI.statusBadge(item.status)}</td>
                  <td>${AppUI.escapeHtml(item.remark || "-")}</td>
                </tr>
              `
            )
            .join("");
  }

  await renderGrades();
})();
