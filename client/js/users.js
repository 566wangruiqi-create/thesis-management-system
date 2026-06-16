(async function () {
  const user = AppAuth.renderShell("users", "用户管理");
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("users", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const teachersTable = document.querySelector("#teachersTable");
  const studentsTable = document.querySelector("#studentsTable");

  teachersTable.innerHTML = AppUI.emptyRow(6, "正在加载教师用户");
  studentsTable.innerHTML = AppUI.emptyRow(6, "正在加载学生用户");

  async function loadUsers() {
    try {
      return await ThesisAPI.getUsersFromServer();
    } catch (error) {
      AppUI.toast(`用户列表暂用本地备用数据：${error.message}`);
      return {
        teachers: ThesisAPI.getTeachers(),
        students: ThesisAPI.getStudents()
      };
    }
  }

  const { teachers, students } = await loadUsers();

  teachersTable.innerHTML =
    teachers.length === 0
      ? AppUI.emptyRow(6, "暂无教师用户")
      : teachers
          .map(
            (item) => `
              <tr>
                <td>${AppUI.escapeHtml(item.id)}</td>
                <td>${AppUI.escapeHtml(item.name)}</td>
                <td>${AppUI.escapeHtml(item.college)}</td>
                <td>${AppUI.escapeHtml(item.title)}</td>
                <td>${AppUI.escapeHtml(item.phone)}</td>
                <td>${AppUI.escapeHtml(item.email)}</td>
              </tr>
            `
          )
          .join("");

  studentsTable.innerHTML =
    students.length === 0
      ? AppUI.emptyRow(6, "暂无学生用户")
      : students
          .map(
            (item) => `
              <tr>
                <td>${AppUI.escapeHtml(item.id)}</td>
                <td>${AppUI.escapeHtml(item.name)}</td>
                <td>${AppUI.escapeHtml(item.className)}</td>
                <td>${AppUI.escapeHtml(item.major)}</td>
                <td>${AppUI.escapeHtml(item.phone)}</td>
                <td>${AppUI.escapeHtml(item.email)}</td>
              </tr>
            `
          )
          .join("");
})();
