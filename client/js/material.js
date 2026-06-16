(async function () {
  const user = AppAuth.renderShell("materials", userTitle());
  if (!user) return;

  const content = document.querySelector(".content");
  if (!AppAuth.hasAccess("materials", user.role)) {
    AppAuth.renderForbidden(content);
    return;
  }

  const formPanel = document.querySelector("#materialFormPanel");
  const form = document.querySelector("#materialForm");
  const tbody = document.querySelector("#materialsTable");
  const subtitle = document.querySelector("#materialsSubtitle");

  if (user.role === "student") {
    formPanel.classList.remove("hidden");
    subtitle.textContent = "提交开题报告、中期检查和论文终稿，查看教师审核意见。";
  } else {
    formPanel.classList.add("hidden");
    subtitle.textContent = "查看并审核自己指导学生提交的论文过程材料。";
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      try {
        await ThesisAPI.submitMaterial({
          type: formData.get("type"),
          title: formData.get("title").trim(),
          fileName: formData.get("fileName").trim()
        });
        form.reset();
        AppUI.toast("材料已提交，等待教师审核。");
        await renderMaterials();
      } catch (error) {
        AppUI.toast(error.message);
      }
    });
  }

  function userTitle() {
    const current = AppAuth.getCurrentUser();
    if (current && current.role === "student") return "材料提交";
    return "材料审核";
  }

  async function getVisibleMaterials() {
    try {
      return await ThesisAPI.getMaterialsFromServer();
    } catch (error) {
      AppUI.toast(`材料记录暂用本地备用数据：${error.message}`);
      return ThesisAPI.getMaterials().filter((item) => {
        if (user.role === "teacher") return item.teacherId === user.teacherId;
        if (user.role === "student") return item.studentId === user.studentId;
        return true;
      });
    }
  }

  async function renderMaterials() {
    tbody.innerHTML = AppUI.emptyRow(9, "正在加载材料记录");

    const materials = await getVisibleMaterials();
    tbody.innerHTML =
      materials.length === 0
        ? AppUI.emptyRow(9, "暂无材料记录")
        : materials
            .map((item) => {
              const action =
                user.role === "teacher" && item.status === "待审核"
                  ? `
                    <div class="toolbar">
                      <button class="btn primary" data-pass="${item.id}">通过</button>
                      <button class="btn danger" data-return="${item.id}">退回</button>
                    </div>
                  `
                  : "-";

              return `
                <tr>
                  <td>${AppUI.escapeHtml(item.studentName)}</td>
                  <td>${AppUI.escapeHtml(item.topicTitle)}</td>
                  <td>${AppUI.escapeHtml(item.type)}</td>
                  <td>${AppUI.escapeHtml(item.title)}</td>
                  <td>${item.fileName ? AppUI.escapeHtml(item.fileName) : "-"}</td>
                  <td>${item.submitDate ? AppUI.escapeHtml(item.submitDate) : "-"}</td>
                  <td>${AppUI.statusBadge(item.status)}</td>
                  <td>${item.reviewComment ? AppUI.escapeHtml(item.reviewComment) : "-"}</td>
                  <td>${action}</td>
                </tr>
              `;
            })
            .join("");

    tbody.querySelectorAll("[data-pass]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await ThesisAPI.reviewMaterial(button.dataset.pass, "已通过", "材料内容完整，审核通过。");
          AppUI.toast("材料已审核通过。");
          await renderMaterials();
        } catch (error) {
          AppUI.toast(error.message);
        }
      });
    });

    tbody.querySelectorAll("[data-return]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await ThesisAPI.reviewMaterial(button.dataset.return, "退回修改", "请补充关键内容后重新提交。");
          AppUI.toast("材料已退回修改。");
          await renderMaterials();
        } catch (error) {
          AppUI.toast(error.message);
        }
      });
    });
  }

  await renderMaterials();
})();
