const materialTypeMap = {
  opening_report: "开题报告",
  midterm_check: "中期检查",
  final_thesis: "论文终稿",
  开题报告: "开题报告",
  中期检查: "中期检查",
  论文终稿: "论文终稿"
};

const materialStatusMap = {
  pending: "待审核",
  approved: "已通过",
  returned: "退回修改",
  unsubmitted: "未提交",
  待审核: "待审核",
  已通过: "已通过",
  退回修改: "退回修改",
  未提交: "未提交"
};

const applicationStatusMap = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  待审核: "待审核",
  已通过: "已通过",
  已拒绝: "已拒绝"
};

function mapMaterialType(type) {
  return materialTypeMap[type] || type;
}

function mapMaterialStatus(status) {
  return materialStatusMap[status] || status;
}

function mapApplicationStatus(status) {
  return applicationStatusMap[status] || status;
}

module.exports = {
  mapMaterialType,
  mapMaterialStatus,
  mapApplicationStatus
};
