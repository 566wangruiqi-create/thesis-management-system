(function () {
  const user = AppAuth.renderShell("users", "用户管理");
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("users", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const teachersTable = document.querySelector("#teachersTable");
  const studentsTable = document.querySelector("#studentsTable");

  const teachers = ThesisAPI.getTeachers();
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

  const students = ThesisAPI.getStudents();
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
