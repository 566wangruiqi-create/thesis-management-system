(async function () {
  const user = AppAuth.renderShell("topics", userTitle());
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("topics", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const formPanel = document.querySelector("#topicFormPanel");
  const toggleBtn = document.querySelector("#toggleTopicForm");
  const form = document.querySelector("#topicForm");
  const tbody = document.querySelector("#topicsTable");
  const pageSubtitle = document.querySelector("#topicSubtitle");

  if (user.role === "teacher") {
    formPanel.classList.remove("hidden");
    document.querySelector("#topicTeacherId").value = user.teacherId;
    pageSubtitle.textContent = "查看和发布自己负责的论文课题。";
  } else if (user.role === "student") {
    formPanel.classList.add("hidden");
    if (toggleBtn) toggleBtn.classList.add("hidden");
    pageSubtitle.textContent = "查看可选课题并提交选题申请。";
  } else {
    formPanel.classList.add("hidden");
    if (toggleBtn) toggleBtn.classList.add("hidden");
    pageSubtitle.textContent = "查看全校课题发布与选择状态。";
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => formPanel.classList.toggle("hidden"));
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      try {
        await ThesisAPI.addTopic({
          title: formData.get("title").trim(),
          major: formData.get("major").trim(),
          quota: formData.get("quota"),
          teacherId: user.teacherId,
          description: formData.get("description").trim()
        });
        form.reset();
        document.querySelector("#topicTeacherId").value = user.teacherId;
        AppUI.toast("课题已新增。");
        await renderTopics();
      } catch (error) {
        AppUI.toast(error.message);
      }
    });
  }

  function userTitle() {
    const current = AppAuth.getCurrentUser();
    if (current && current.role === "student") return "查看课题";
    return "课题管理";
  }

  async function getVisibleTopics() {
    const topics = await ThesisAPI.getTopics();
    return topics.filter((topic) => {
      if (user.role === "teacher") return topic.teacherId === user.teacherId;
      if (user.role === "student") return topic.status === "可选";
      return true;
    });
  }

  async function getStudentApplications() {
    if (user.role !== "student") return [];
    return (await ThesisAPI.getApplications()).filter((item) => item.studentId === user.studentId);
  }

  async function renderTopics() {
    tbody.innerHTML = AppUI.emptyRow(7, "正在加载课题数据");

    try {
      const topics = await getVisibleTopics();
      const studentApplications = await getStudentApplications();

      tbody.innerHTML =
        topics.length === 0
          ? AppUI.emptyRow(7, "暂无课题数据")
          : topics
              .map((topic) => {
                const existing = studentApplications.find(
                  (item) => item.topicId === topic.id && item.status !== "已拒绝"
                );
                const canApply = user.role === "student" && topic.status === "可选" && !existing;
                const action =
                  user.role === "student"
                    ? `<button class="btn primary" data-apply="${topic.id}" ${
                        canApply ? "" : "disabled"
                      }>${existing ? "已申请" : "申请选题"}</button>`
                    : "-";

                return `
                  <tr>
                    <td>${AppUI.escapeHtml(topic.id)}</td>
                    <td>
                      <strong>${AppUI.escapeHtml(topic.title)}</strong><br />
                      <span class="muted">${AppUI.escapeHtml(topic.description)}</span>
                    </td>
                    <td>${AppUI.escapeHtml(topic.teacherName)}</td>
                    <td>${AppUI.escapeHtml(topic.major)}</td>
                    <td>${topic.selectedCount}/${topic.quota}</td>
                    <td>${AppUI.statusBadge(topic.status)}</td>
                    <td>${action}</td>
                  </tr>
                `;
              })
              .join("");

      tbody.querySelectorAll("[data-apply]").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await ThesisAPI.applyTopic(button.dataset.apply);
            AppUI.toast("选题申请已提交。");
            await renderTopics();
          } catch (error) {
            AppUI.toast(error.message);
          }
        });
      });
    } catch (error) {
      tbody.innerHTML = AppUI.emptyRow(7, `课题数据加载失败：${error.message}`);
    }
  }

  await renderTopics();
})();
