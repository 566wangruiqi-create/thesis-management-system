(async function () {
  const user = AppAuth.renderShell("dashboard", "后台首页");
  if (!user) return;

  const statsGrid = document.querySelector("#statsGrid");
  const recentApplications = document.querySelector("#recentApplications");

  statsGrid.innerHTML = `
    <article class="stat-card"><div class="label">数据加载中</div><div class="value">...</div></article>
  `;
  recentApplications.innerHTML = AppUI.emptyRow(5, "正在加载选题申请记录");

  const flowItems = [
    ["发布课题", "教师维护可选论文课题"],
    ["学生选题", "学生提交选题申请"],
    ["审核选题", "教师通过或拒绝申请"],
    ["提交材料", "学生提交过程材料"],
    ["审核材料", "教师给出审核意见"],
    ["安排答辩", "管理员设置时间地点"],
    ["录入成绩", "管理员登记最终成绩"],
    ["论文归档", "管理员完成档案记录"]
  ];

  document.querySelector("#flowList").innerHTML = flowItems
    .map(
      ([title, text], index) => `
        <div class="flow-step">
          <strong>${index + 1}. ${title}</strong>
          <span>${text}</span>
        </div>
      `
    )
    .join("");

  async function loadStats() {
    try {
      return await ThesisAPI.getDashboardStatsFromServer();
    } catch (error) {
      AppUI.toast(`首页统计暂用本地备用数据：${error.message}`);
      return ThesisAPI.getDashboardStats();
    }
  }

  async function loadApplications() {
    try {
      return await ThesisAPI.getApplicationsFromServer();
    } catch (error) {
      return ThesisAPI.getApplications();
    }
  }

  const stats = await loadStats();
  const statItems = [
    ["课题总数", stats.topicCount],
    ["已选题人数", stats.selectedStudentCount],
    ["待审核材料数", stats.pendingMaterialCount],
    ["已安排答辩人数", stats.arrangedDefenseCount],
    ["已归档论文数", stats.archivedCount]
  ];

  statsGrid.innerHTML = statItems
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <div class="label">${label}</div>
          <div class="value">${value}</div>
        </article>
      `
    )
    .join("");

  const applications = (await loadApplications())
    .filter((item) => {
      if (user.role === "teacher") return item.teacherId === user.teacherId;
      if (user.role === "student") return item.studentId === user.studentId;
      return true;
    })
    .slice(0, 5);

  recentApplications.innerHTML =
    applications.length === 0
      ? AppUI.emptyRow(5, "暂无选题申请记录")
      : applications
          .map(
            (item) => `
              <tr>
                <td>${AppUI.escapeHtml(item.studentName)}</td>
                <td>${AppUI.escapeHtml(item.topicTitle)}</td>
                <td>${AppUI.escapeHtml(item.teacherName)}</td>
                <td>${AppUI.escapeHtml(item.applyDate)}</td>
                <td>${AppUI.statusBadge(item.status)}</td>
              </tr>
            `
          )
          .join("");
})();
