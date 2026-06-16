(function () {
  const USER_KEY = "thesis_current_user";
  const TOKEN_KEY = "thesis_auth_token";

  const roleNames = {
    admin: "管理员",
    teacher: "教师",
    student: "学生"
  };

  const menus = {
    admin: [
      ["dashboard", "首页", "首"],
      ["users", "用户管理", "人"],
      ["topics", "课题管理", "题"],
      ["applications", "选题申请", "申"],
      ["defense", "答辩安排", "辩"],
      ["grades", "成绩管理", "分"],
      ["archives", "论文归档", "档"]
    ],
    teacher: [
      ["dashboard", "首页", "首"],
      ["topics", "课题管理", "题"],
      ["applications", "选题申请", "申"],
      ["materials", "材料审核", "材"],
      ["defense", "答辩安排", "辩"],
      ["grades", "成绩查看", "分"]
    ],
    student: [
      ["dashboard", "首页", "首"],
      ["topics", "查看课题", "题"],
      ["applications", "我的选题", "申"],
      ["materials", "材料提交", "材"],
      ["defense", "我的答辩", "辩"],
      ["grades", "我的成绩", "分"],
      ["archives", "我的归档", "档"]
    ]
  };

  const pagePaths = {
    dashboard: "dashboard.html",
    topics: "pages/topics.html",
    applications: "pages/applications.html",
    materials: "pages/materials.html",
    defense: "pages/defense.html",
    grades: "pages/grades.html",
    archives: "pages/archives.html",
    users: "pages/users.html"
  };

  function isInPagesDir() {
    return window.location.pathname.replace(/\\/g, "/").includes("/pages/");
  }

  function pathFor(key) {
    const path = pagePaths[key];
    if (!path) return "#";
    if (key === "dashboard") {
      return isInPagesDir() ? "../dashboard.html" : "./dashboard.html";
    }
    return isInPagesDir() ? `./${path.replace("pages/", "")}` : `./${path}`;
  }

  function loginPath() {
    return isInPagesDir() ? "../login.html" : "./login.html";
  }

  function dashboardPath() {
    return isInPagesDir() ? "../dashboard.html" : "./dashboard.html";
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

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  }

  function setCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearCurrentUser() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  async function login(username, password) {
    if (window.ThesisAPI && window.ThesisAPI.login) {
      const result = await window.ThesisAPI.login(username, password);
      setToken(result.token);
      setCurrentUser(result.user);
      return result.user;
    }

    const user = window.MOCK_DATA.users.find(
      (item) => item.username === username && item.password === password
    );
    if (!user) throw new Error("账号或密码不正确。");
    const { password: _, ...safeUser } = user;
    setCurrentUser(safeUser);
    return safeUser;
  }

  function requireAuth() {
    const user = getCurrentUser();
    const token = getToken();
    if (!user || !token) {
      window.location.href = loginPath();
      return null;
    }
    return user;
  }

  function bindLoginForm() {
    const form = document.querySelector("#loginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = document.querySelector("#username").value.trim();
      const password = document.querySelector("#password").value.trim();
      const message = document.querySelector("#loginMessage");
      const submitButton = form.querySelector("button[type='submit']");

      try {
        message.textContent = "正在登录...";
        if (submitButton) submitButton.disabled = true;
        await login(username, password);
        window.location.href = "./dashboard.html";
      } catch (error) {
        message.textContent = error.message;
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  function renderShell(activeKey, title) {
    const user = requireAuth();
    if (!user) return null;

    const nav = document.querySelector("#sidebarNav");
    const items = menus[user.role] || [];
    if (nav) {
      nav.innerHTML = items
        .map(
          ([key, label, icon]) => `
            <a class="nav-item ${key === activeKey ? "active" : ""}" href="${pathFor(key)}">
              <span class="nav-icon">${icon}</span>
              <span>${label}</span>
            </a>
          `
        )
        .join("");
    }

    const topTitle = document.querySelector("#topbarTitle");
    if (topTitle) topTitle.textContent = title || "毕业论文管理系统";

    const userName = document.querySelector("#currentUserName");
    if (userName) userName.textContent = user.name;

    const userRole = document.querySelector("#currentUserRole");
    if (userRole) userRole.textContent = roleNames[user.role] || user.role;

    const avatar = document.querySelector("#currentUserAvatar");
    if (avatar) avatar.textContent = user.name.slice(0, 1);

    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        clearCurrentUser();
        window.location.href = loginPath();
      });
    }

    return user;
  }

  function hasAccess(pageKey, role) {
    return Boolean((menus[role] || []).some(([key]) => key === pageKey));
  }

  function renderForbidden(container, message) {
    if (!container) return;
    container.innerHTML = `
      <section class="panel forbidden">
        <h1>无权限访问</h1>
        <p class="muted">${message || "当前角色不能访问该页面。"}</p>
        <a class="btn primary" href="${dashboardPath()}">返回首页</a>
      </section>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function badgeClass(status) {
    const map = {
      可选: "available",
      已通过: "approved",
      已归档: "archived",
      已安排: "scheduled",
      待审核: "pending",
      待审核材料: "review",
      已拒绝: "rejected",
      退回修改: "returned",
      已关闭: "closed",
      已被选择: "selected",
      未提交: "none",
      未归档: "none",
      未通过: "fail"
    };
    return map[status] || "default";
  }

  function statusBadge(status) {
    return `<span class="badge ${badgeClass(status)}">${escapeHtml(status)}</span>`;
  }

  function toast(message) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 2400);
  }

  function emptyRow(colspan, text) {
    return `<tr><td colspan="${colspan}" class="empty">${escapeHtml(text)}</td></tr>`;
  }

  window.AppAuth = {
    login,
    bindLoginForm,
    requireAuth,
    renderShell,
    getCurrentUser,
    getToken,
    hasAccess,
    renderForbidden,
    clearCurrentUser
  };

  window.AppUI = {
    escapeHtml,
    statusBadge,
    toast,
    emptyRow,
    roleNames
  };
})();
