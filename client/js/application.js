(function () {
  const user = AppAuth.renderShell("applications", userTitle());
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("applications", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const tbody = document.querySelector("#applicationsTable");
  const subtitle = document.querySelector("#applicationsSubtitle");

  if (user.role === "teacher") {
    subtitle.textContent = "审核学生提交到自己课题下的选题申请。";
  } else if (user.role === "student") {
    subtitle.textContent = "查看自己提交的选题申请及审核结果。";
  } else {
    subtitle.textContent = "查看全部选题申请状态。";
  }

  function userTitle() {
    const current = AppAuth.getCurrentUser();
    if (current && current.role === "student") return "我的选题";
    return "选题申请";
  }

  function getVisibleApplications() {
    return ThesisAPI.getApplications().filter((item) => {
      if (user.role === "teacher") return item.teacherId === user.teacherId;
      if (user.role === "student") return item.studentId === user.studentId;
      return true;
    });
  }

  function renderApplications() {
    const applications = getVisibleApplications();
    tbody.innerHTML =
      applications.length === 0
        ? AppUI.emptyRow(8, "暂无选题申请记录")
        : applications
            .map((item) => {
              const action =
                user.role === "teacher" && item.status === "待审核"
                  ? `
                    <div class="toolbar">
                      <button class="btn primary" data-approve="${item.id}">通过</button>
                      <button class="btn danger" data-reject="${item.id}">拒绝</button>
                    </div>
                  `
                  : "-";

              return `
                <tr>
                  <td>${AppUI.escapeHtml(item.id)}</td>
                  <td>${AppUI.escapeHtml(item.studentName)}</td>
                  <td>${AppUI.escapeHtml(item.topicTitle)}</td>
                  <td>${AppUI.escapeHtml(item.teacherName)}</td>
                  <td>${AppUI.escapeHtml(item.applyDate)}</td>
                  <td>${item.reviewDate ? AppUI.escapeHtml(item.reviewDate) : "-"}</td>
                  <td>${AppUI.statusBadge(item.status)}<br /><span class="muted">${AppUI.escapeHtml(item.comment)}</span></td>
                  <td>${action}</td>
                </tr>
              `;
            })
            .join("");

    tbody.querySelectorAll("[data-approve]").forEach((button) => {
      button.addEventListener("click", () => {
        ThesisAPI.approveApplication(button.dataset.approve);
        AppUI.toast("选题申请已通过。");
        renderApplications();
      });
    });

    tbody.querySelectorAll("[data-reject]").forEach((button) => {
      button.addEventListener("click", () => {
        ThesisAPI.rejectApplication(button.dataset.reject);
        AppUI.toast("选题申请已拒绝。");
        renderApplications();
      });
    });
  }

  renderApplications();
})();
