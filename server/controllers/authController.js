const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      teacher_id: user.teacher_id,
      student_id: user.student_id
    },
    process.env.JWT_SECRET || "graduation_thesis_secret",
    { expiresIn: "7d" }
  );
}

// 登录接口：根据账号查找用户，兼容 bcrypt 密文和当前 seed.sql 中的明文密码。
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "账号和密码不能为空"
      });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "账号或密码错误"
      });
    }

    const passwordIsHash = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
    const isValid = passwordIsHash
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "账号或密码错误"
      });
    }

    res.json({
      success: true,
      message: "登录成功",
      data: {
        token: createToken(user),
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
}

// 当前用户接口：根据 JWT 中的用户 id 查询最新用户信息。
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在"
      });
    }

    res.json({
      success: true,
      message: "获取当前用户成功",
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getMe
};
