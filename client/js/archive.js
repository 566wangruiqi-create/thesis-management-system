(async function () {
  const user = AppAuth.renderShell("archives", userTitle());
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("archives", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const formPanel = document.querySelector("#archiveFormPanel");
  const form = document.querySelector("#archiveForm");
  const studentSelect = document.querySelector("#archiveStudent");
  const tbody = document.querySelector("#archivesTable");
  const subtitle = document.querySelector("#archivesSubtitle");

  if (user.role === "admin") {
    formPanel.classList.remove("hidden");
    subtitle.textContent = "为已通过成绩的学生记录论文归档状态。";
    await fillStudentOptions();
  } else if (user.role === "student") {
    formPanel.classList.add("hidden");
    subtitle.textContent = "查看自己的论文归档状态和存放位置。";
  } else {
    formPanel.classList.add("hidden");
    subtitle.textContent = "查看自己指导学生的论文归档情况。";
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      try {
        await ThesisAPI.addArchive({
          studentId: formData.get("studentId"),
          archiveDate: formData.get("archiveDate"),
          location: formData.get("location").trim(),
          note: formData.get("note").trim()
        });
        form.reset();
        await fillStudentOptions();
        AppUI.toast("论文归档已保存。");
        await renderArchives();
      } catch (error) {
        AppUI.toast(error.message);
      }
    });
  }

  function userTitle() {
    const current = AppAuth.getCurrentUser();
    if (current && current.role === "student") return "我的归档";
    return "论文归档";
  }

  async function fillStudentOptions() {
    if (!studentSelect) return;

    let grades = [];
    try {
      grades = (await ThesisAPI.getGrades()).filter((item) => item.passed);
    } catch (error) {
      AppUI.toast(`学生选项暂用本地备用数据：${error.message}`);
      grades = ThesisAPI.getMockGrades().filter((item) => item.passed);
    }

    studentSelect.innerHTML =
      grades.length === 0
        ? `<option value="">暂无可归档学生</option>`
        : grades
            .map(
              (item) =>
                `<option value="${item.studentId}">${AppUI.escapeHtml(item.studentName)} - ${AppUI.escapeHtml(item.topicTitle)}</option>`
            )
            .join("");
  }

  async function getVisibleArchives() {
    try {
      return await ThesisAPI.getArchives();
    } catch (error) {
      AppUI.toast(`归档记录暂用本地备用数据：${error.message}`);
      return ThesisAPI.getMockArchives().filter((item) => {
        if (user.role === "teacher") return item.teacherId === user.teacherId;
        if (user.role === "student") return item.studentId === user.studentId;
        return true;
      });
    }
  }

  async function renderArchives() {
    tbody.innerHTML = AppUI.emptyRow(7, "正在加载归档记录");

    const archives = await getVisibleArchives();
    tbody.innerHTML =
      archives.length === 0
        ? AppUI.emptyRow(7, "暂无归档记录")
        : archives
            .map(
              (item) => `
                <tr>
                  <td>${AppUI.escapeHtml(item.studentName)}</td>
                  <td>${AppUI.escapeHtml(item.topicTitle)}</td>
                  <td>${AppUI.escapeHtml(item.teacherName)}</td>
                  <td>${item.archiveDate ? AppUI.escapeHtml(item.archiveDate) : "-"}</td>
                  <td>${AppUI.statusBadge(item.status)}</td>
                  <td>${AppUI.escapeHtml(item.location || "-")}</td>
                  <td>${AppUI.escapeHtml(item.note || "-")}</td>
                </tr>
              `
            )
            .join("");
  }

  await renderArchives();
})();
