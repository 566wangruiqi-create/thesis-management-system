# 毕业论文管理系统

## 一、项目简介

本项目是管理信息系统课程设计项目，系统名称为“毕业论文管理系统”。

系统用于模拟高校毕业论文管理的核心流程，包括课题发布、学生选题、教师审核、论文过程材料提交、答辩安排、成绩录入和论文归档等功能。

## 二、技术栈

- 前端：HTML、CSS、JavaScript
- 后端：Node.js、Express
- 数据库：MySQL
- 后端依赖：mysql2、cors、dotenv、jsonwebtoken、bcryptjs
- 代码管理：Git

## 三、系统角色

系统包括三类用户：

1. 管理员 admin
2. 教师 teacher
3. 学生 student

## 四、核心业务流程

教师发布课题 → 学生选择课题 → 教师审核选题 → 学生提交材料 → 教师审核材料 → 管理员安排答辩 → 管理员录入成绩 → 管理员完成归档

## 五、主要功能模块

- 用户登录
- 角色权限管理
- 课题管理
- 学生选题管理
- 论文材料提交与审核
- 答辩安排管理
- 成绩管理
- 论文归档管理
- 用户管理

## 六、项目目录结构

```text
毕业论文管理系统/
├─ client/       # 前端页面和静态资源
├─ server/       # Express 后端服务
├─ docs/         # 项目文档
├─ README.md     # 项目说明
└─ .gitignore    # Git 忽略文件
```

## 七、运行说明

### 1. 准备数据库

先确保本地 MySQL 已启动，然后在项目根目录执行：

```bash
mysql -u root -p < server/database/schema.sql
mysql -u root -p < server/database/seed.sql
```

### 2. 配置后端环境变量

进入 `server` 目录，复制环境变量示例：

```bash
cd server
copy .env.example .env
```

根据本地 MySQL 配置修改 `server/.env`。不要提交真实 `.env` 文件。

### 3. 安装并启动后端

```bash
npm install
npm start
```

开发模式可使用：

```bash
npm run dev
```

后端默认运行在：

```text
http://localhost:3000
```

健康检查接口：

```text
GET http://localhost:3000/api/health
```

正常返回：

```json
{
  "success": true,
  "message": "毕业论文管理系统后端服务运行正常"
}
```

### 4. 打开前端

后端启动后，直接打开：

```text
client/login.html
```

前端 API 地址配置在 `client/js/api.js`：

```text
http://localhost:3000/api
```

## 八、测试账号

```text
管理员：admin / 123456
教师：teacher / 123456
学生：student / 123456
```

## 九、角色菜单

管理员：

- 首页
- 用户管理
- 课题管理
- 选题申请
- 答辩安排
- 成绩管理
- 论文归档

教师：

- 首页
- 课题管理
- 选题申请
- 材料审核
- 答辩安排
- 成绩查看

学生：

- 首页
- 查看课题
- 我的选题
- 材料提交
- 我的答辩
- 我的成绩
- 我的归档

## 十、部署说明

当前项目以本地课程演示为主。后续部署时，可将 `client` 部署到 Netlify，将 `server` 部署到 Render 或 Railway，并在部署平台中配置数据库环境变量。
