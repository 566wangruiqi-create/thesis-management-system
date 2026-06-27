# 毕业论文管理系统

本项目是管理信息系统课程设计项目，系统名称为“毕业论文管理系统”。系统用于模拟高校毕业论文管理的核心流程，包括课题发布、学生选题、教师审核、论文过程材料提交、答辩安排、成绩录入和论文归档等功能。

当前 `demo-frontend` 分支已经支持前端静态演示模式，可直接部署到 Netlify，不依赖真实后端和 MySQL 数据库。真实后端版本仍保留在项目中，本分支的前端会在真实 API 不可用时自动切换到本地演示数据。

## 技术栈

- 前端：HTML、CSS、JavaScript
- 演示数据：mock 数据 + localStorage
- 后端：Node.js、Express
- 数据库：MySQL
- 部署：Netlify 静态站点

## 演示账号

```text
管理员：admin / 123456
学生：student01 / 123456
教师：teacher01 / 123456
```

## 前端演示模式

- 访问 `client/login.html?demo=1` 可强制进入演示模式。
- 访问 `client/login.html?resetDemo=1` 可重置浏览器本地演示数据。
- 演示模式数据保存在浏览器 `localStorage`，刷新页面不会丢失。
- 在 Netlify 等非 localhost 静态站点中，前端会默认进入演示模式。
- 如果 `http://localhost:3000/api` 不可用，前端会自动切换到演示模式。
- 页面顶部会显示“当前为前端演示模式，数据保存在浏览器本地”。

演示数据文件位于：

```text
client/js/mockData.js
```

统一前端演示 API 位于：

```text
client/js/demoApi.js
client/js/api.js
```

## 核心业务流程

教师发布课题 → 学生选择课题 → 教师审核选题 → 学生提交材料 → 教师审核材料 → 管理员安排答辩 → 管理员录入成绩 → 管理员完成归档

## 主要功能模块

- 用户登录
- 角色权限管理
- 课题管理
- 学生选题管理
- 论文材料提交与审核
- 答辩安排管理
- 成绩管理
- 论文归档管理
- 用户管理

## 项目目录结构

```text
毕业论文管理系统/
├─ client/          # 前端页面和静态资源
│  ├─ js/mockData.js
│  ├─ js/demoApi.js
│  └─ js/api.js
├─ server/          # Express 后端服务
├─ docs/            # 项目文档
├─ netlify.toml     # Netlify 静态部署配置
└─ README.md
```

## Netlify 部署

1. 将当前仓库推送到 Git 托管平台。
2. 在 Netlify 新建站点，选择该仓库。
3. 构建设置保持：

```text
Build command: 留空
Publish directory: client
```

仓库根目录已提供 `netlify.toml`，Netlify 会自动使用 `client` 作为发布目录。部署后访问站点首页会跳转到 `login.html`，也可以访问 `/demo` 直接进入演示模式。

## 本地真实后端运行

如需使用真实数据库连接版本，可启动 `server` 后端。前端默认真实 API 地址为：

```text
http://localhost:3000/api
```

### 1. 准备数据库

```bash
mysql -u root -p < server/database/schema.sql
mysql -u root -p < server/database/seed.sql
```

### 2. 配置后端环境变量

在 `server` 目录创建 `.env`，按本地 MySQL 配置填写：

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=graduation_thesis_system
DB_PORT=3306
JWT_SECRET=graduation_thesis_secret
```

不要提交真实 `.env` 文件。

### 3. 安装并启动后端

```bash
npm install
npm start
```

后端默认运行在：

```text
http://localhost:3000
```

健康检查接口：

```text
GET http://localhost:3000/api/health
```
