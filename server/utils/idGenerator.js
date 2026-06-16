const pool = require("../config/db");

async function generateId(tableName, prefix) {
  const [rows] = await pool.query(
    `SELECT id FROM ${tableName} WHERE id LIKE ? ORDER BY CAST(SUBSTRING(id, ?) AS UNSIGNED) DESC LIMIT 1`,
    [`${prefix}%`, prefix.length + 1]
  );

  const current = rows[0] ? Number(rows[0].id.replace(prefix, "")) : 0;
  return `${prefix}${String(current + 1).padStart(3, "0")}`;
}

module.exports = generateId;
