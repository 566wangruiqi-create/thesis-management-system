(async function () {
  const user = AppAuth.renderShell("defense", userTitle());
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("defense", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const formPanel = document.querySelector("#defenseFormPanel");
  const form = document.querySelector("#defenseForm");
  const studentSelect = document.querySelector("#defenseStudent");
  const tbody = document.querySelector("#defenseTable");
  const subtitle = document.querySelector("#defenseSubtitle");

  if (user.role === "admin") {
    formPanel.classList.remove("hidden");
    subtitle.textContent = "为已通过选题的学生模拟安排答辩时间、地点和小组。";
    await fillStudentOptions();
  } else if (user.role === "student") {
    formPanel.classList.add("hidden");
    subtitle.textContent = "查看自己的答辩时间、地点和答辩小组。";
  } else {
    formPanel.classList.add("hidden");
    subtitle.textContent = "查看自己指导学生的答辩安排。";
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      try {
        await ThesisAPI.addDefenseArrangement({
          studentId: formData.get("studentId"),
          time: formData.get("time").trim(),
          place: formData.get("place").trim(),
          group: formData.get("group").trim(),
          chair: formData.get("chair").trim()
        });
        form.reset();
        await fillStudentOptions();
        AppUI.toast("答辩安排已保存。");
        await renderDefense();
      } catch (error) {
        AppUI.toast(error.message);
      }
    });
  }

  function userTitle() {
    const current = AppAuth.getCurrentUser();
    if (current && current.role === "student") return "我的答辩";
    return "答辩安排";
  }

  async function approvedApplications() {
    try {
      return (await ThesisAPI.getApplicationsFromServer()).filter((item) => item.status === "已通过");
    } catch (error) {
      AppUI.toast(`学生选项暂用本地备用数据：${error.message}`);
      return ThesisAPI.getApplications().filter((item) => item.status === "已通过");
    }
  }

  async function fillStudentOptions() {
    if (!studentSelect) return;
    const items = await approvedApplications();
    studentSelect.innerHTML =
      items.length === 0
        ? `<option value="">暂无已通过选题学生</option>`
        : items
            .map(
              (item) =>
                `<option value="${item.studentId}">${AppUI.escapeHtml(item.studentName)} - ${AppUI.escapeHtml(item.topicTitle)}</option>`
            )
            .join("");
  }

  async function getVisibleArrangements() {
    try {
      return await ThesisAPI.getDefenseArrangements();
    } catch (error) {
      AppUI.toast(`答辩安排暂用本地备用数据：${error.message}`);
      return ThesisAPI.getMockDefenseArrangements().filter((item) => {
        if (user.role === "teacher") return item.teacherId === user.teacherId;
        if (user.role === "student") return item.studentId === user.studentId;
        return true;
      });
    }
  }

  async function renderDefense() {
    tbody.innerHTML = AppUI.emptyRow(8, "正在加载答辩安排");

    const arrangements = await getVisibleArrangements();
    tbody.innerHTML =
      arrangements.length === 0
        ? AppUI.emptyRow(8, "暂无答辩安排")
        : arrangements
            .map(
              (item) => `
                <tr>
                  <td>${AppUI.escapeHtml(item.studentName)}</td>
                  <td>${AppUI.escapeHtml(item.topicTitle)}</td>
                  <td>${AppUI.escapeHtml(item.teacherName)}</td>
                  <td>${AppUI.escapeHtml(item.time)}</td>
                  <td>${AppUI.escapeHtml(item.place)}</td>
                  <td>${AppUI.escapeHtml(item.group)}</td>
                  <td>${AppUI.escapeHtml(item.chair)}</td>
                  <td>${AppUI.statusBadge(item.status)}</td>
                </tr>
              `
            )
            .join("");
  }

  await renderDefense();
})();
