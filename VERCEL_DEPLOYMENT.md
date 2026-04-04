# Vercel 部署指南

本项目已配置为可以直接部署到 Vercel，支持完整的前后端功能。

## 部署步骤

### 1. 准备工作

确保你已经在 Vercel 官网 (https://vercel.com) 注册账号并安装了 Vercel CLI：

```bash
npm install -g vercel
```

### 2. 连接 Vercel KV 数据库

由于项目使用卡密系统需要数据存储，你需要：

1. 登录 Vercel 控制台
2. 创建一个新的 KV 数据库（Storage → Create Database → KV）
3. 记录 KV 数据库的连接信息

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

- `KV_REST_API_URL` - KV 数据库的 REST API URL
- `KV_REST_API_TOKEN` - KV 数据库的访问令牌
- `ADMIN_PASSWORD` - 管理员密码（可选，默认为 liujuan2012）

可以通过 Vercel CLI 设置：

```bash
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
vercel env add ADMIN_PASSWORD
```

### 4. 部署项目

```bash
# 登录 Vercel
vercel login

# 首次部署
vercel

# 生产环境部署
vercel --prod
```

### 5. 更新前端 API 地址

部署成功后，你需要更新前端的 API 地址：

方法一：使用环境变量
```bash
# 在项目根目录创建 .env 文件
echo "VITE_API_BASE=https://你的域名.vercel.app/api" > .env
```

方法二：修改配置文件
编辑 `src/config/api.js`，将 API_BASE 改为你的 Vercel 域名：
```javascript
export const API_BASE = 'https://你的域名.vercel.app/api'
```

然后重新部署：
```bash
vercel --prod
```

## 项目结构说明

### API 路由

- `POST /api/auth/admin` - 管理员登录
- `POST /api/cards/verify` - 验证卡密
- `POST /api/cards/generate` - 生成卡密（需要管理员权限）
- `GET /api/cards` - 获取所有卡密（需要管理员权限）
- `DELETE /api/cards/:id` - 删除卡密（需要管理员权限）

### 数据存储

所有卡密数据存储在 Vercel KV 数据库中，无需担心文件存储问题。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 如果需要本地测试 API，可以启动 server
cd server
node server.js
```

## 注意事项

1. **环境变量安全**：不要将敏感的环境变量提交到 Git 仓库
2. **KV 数据库限制**：免费版 Vercel KV 有使用限制，生产环境建议升级
3. **CORS 配置**：Vercel Serverless Functions 默认处理了 CORS，无需额外配置
4. **构建优化**：确保前端构建时正确引用 API 地址

## 故障排除

### 常见问题

1. **API 返回 404**
   - 检查 API 路径是否正确
   - 确认环境变量已配置

2. **卡密验证失败**
   - 检查 KV 数据库连接是否正常
   - 查看 Vercel 函数日志

3. **构建失败**
   - 确保所有依赖已安装
   - 检查 Node.js 版本兼容性

### 查看日志

```bash
# 查看部署日志
vercel logs

# 实时查看日志
vercel logs --follow
```

## 更多资源

- [Vercel 文档](https://vercel.com/docs)
- [Vercel KV 文档](https://vercel.com/docs/storage/vercel-kv)
- [Serverless Functions 文档](https://vercel.com/docs/functions)
