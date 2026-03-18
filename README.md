# 2026-design

作为 Web 开发课程的大作业，同时参加 2026 年计算机设计大赛。

## 项目结构

本项目采用前后端分离架构：

```
2026-design/
├── frontend/       # 前台 —— Vue 3 + Vite
└── backend/        # 后台 —— Node.js + Express + MongoDB
```

## 技术栈

### 前台（frontend）
- **框架**：Vue 3（Composition API）
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **HTTP 客户端**：Axios

### 后台（backend）
- **运行时**：Node.js
- **框架**：Express 4
- **数据库**：MongoDB（Mongoose ODM）
- **认证**：JWT（JSON Web Token）
- **密码加密**：bcryptjs

## 快速开始

### 启动后台

```bash
cd backend
cp .env.example .env   # 填入实际配置
npm install
npm run dev            # 开发模式（nodemon 热重载）
```

后台服务默认运行在 `http://localhost:3000`。

### 启动前台

```bash
cd frontend
npm install
npm run dev
```

前台默认运行在 `http://localhost:5173`，API 请求自动代理到后台。

## API 接口

| 方法   | 路径                   | 说明             | 认证 |
|--------|------------------------|------------------|------|
| POST   | /api/auth/register     | 用户注册         | 否   |
| POST   | /api/auth/login        | 用户登录         | 否   |
| GET    | /api/works             | 获取作品列表     | 否   |
| GET    | /api/works/:id         | 获取单个作品     | 否   |
| POST   | /api/works             | 创建作品         | 是   |
| PUT    | /api/works/:id         | 更新作品         | 是   |
| DELETE | /api/works/:id         | 删除作品         | 是   |
| GET    | /api/users/profile     | 获取用户信息     | 是   |
| PUT    | /api/users/profile     | 更新用户信息     | 是   |
