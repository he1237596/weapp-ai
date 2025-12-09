# Supabase + Cloudflare 完整部署指南

## 概述

本指南将帮助你设置完整的 Supabase + Cloudflare Workers 服务端架构，为婚礼策划小程序提供后端服务。

## 架构说明

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端 (Taro)   │───▶│ Cloudflare API   │───▶│   Supabase      │
│   + Zustand     │    │     Gateway      │    │   Database      │
│                 │    │                  │    │   + Auth        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

- **前端**: Taro + Zustand 状态管理
- **API网关**: Cloudflare Workers 提供安全性和额外功能
- **数据库**: Supabase PostgreSQL + 实时功能
- **存储**: Supabase Storage 用于文件上传
- **认证**: Supabase Auth

## 步骤一：设置 Supabase

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 创建新组织（如果还没有）
4. 创建新项目：
   - 项目名称：`wedding-planner`
   - 数据库密码：生成强密码并保存
   - 选择区域：选择离用户最近的区域

### 2. 获取项目信息

项目创建后，获取以下信息：
- Project URL: `https://your-project-id.supabase.co`
- API Key (anon): `your-anon-key`
- API Key (service_role): `your-service-role-key` (保密)

### 3. 执行数据库迁移

1. 进入 Supabase Dashboard
2. 打开 SQL Editor
3. 复制并执行 `supabase/schema.sql` 中的内容

### 4. 配置认证设置

在 Authentication > Settings 中：

1. 启用 Email/Password 认证
2. 配置重定向URL：
   - 开发环境：`http://localhost:10086`
   - 生产环境：`https://your-frontend-domain.com`
3. 可选：配置微信小程序认证

### 5. 配置存储

1. 进入 Storage
2. 创建新的 bucket：`uploads`
3. 设置为公开访问或配置访问策略

## 步骤二：设置 Cloudflare Workers

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置 Workers 项目

进入 `cloudflare-workers` 目录：

```bash
cd cloudflare-workers
npm install
```

### 4. 设置环境变量

```bash
# 设置 secrets (加密环境变量)
wrangler secret put SUPABASE_URL
# 输入你的 Supabase URL

wrangler secret put SUPABASE_SERVICE_KEY
# 输入你的 Service Role Key
```

### 5. 部署 Workers

```bash
# 开发环境部署
wrangler deploy --env development

# 生产环境部署
wrangler deploy --env production
```

### 6. 配置自定义域名（可选）

在 `wrangler.toml` 中配置域名：

```toml
[env.production]
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## 步骤三：配置前端应用

### 1. 复制环境变量

```bash
cp .env.example .env
```

### 2. 编辑 .env 文件

```env
# Supabase 配置
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudflare Workers API 配置
REACT_APP_CLOUDFLARE_API_URL=https://api.yourdomain.com

# 应用配置
NODE_ENV=development
REACT_APP_NAME="Wedding Planner"
REACT_APP_VERSION=1.0.0
```

### 3. 安装依赖

```bash
npm install
```

### 4. 测试连接

```bash
npm run dev:h5
```

## 步骤四：部署自动化

### 1. GitHub Actions 配置

确保在 GitHub 仓库设置中添加以下 Secrets：

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `LHCI_GITHUB_APP_TOKEN`

### 2. 使用部署脚本

```bash
# 给脚本执行权限
chmod +x scripts/deploy.sh

# 部署到开发环境
./scripts/deploy.sh development

# 部署到生产环境
./scripts/deploy.sh production

# 跳过测试部署
SKIP_TESTS=true ./scripts/deploy.sh production
```

## 步骤五：数据初始化

### 1. 创建管理员用户

可以通过 Supabase Dashboard 或 API 创建第一个用户：

```sql
-- 在 SQL Editor 中执行
INSERT INTO public.users (id, email, nickname) 
VALUES ('your-user-id', 'admin@example.com', '管理员');
```

### 2. 测试数据导入

```sql
-- 插入示例事件
INSERT INTO public.events (id, title, creator_id, start_date, budget, status) 
VALUES ('test-event-id', '测试婚礼', 'your-user-id', '2024-12-25', 100000, 'planning');

-- 添加用户为事件成员
INSERT INTO public.event_members (event_id, user_id, role) 
VALUES ('test-event-id', 'your-user-id', 'owner');
```

## 步骤六：监控和维护

### 1. 性能监控

- 使用 Cloudflare Analytics 监控 API 性能
- 使用 Supabase Logs 查看数据库操作
- 设置 Lighthouse CI 进行性能测试

### 2. 安全检查

- 定期检查 Supabase RLS 策略
- 监控 Cloudflare Workers 的异常日志
- 定期轮换 API 密钥

### 3. 备份策略

- Supabase 自动备份（每天）
- 手动导出重要数据
- 配置 Cloudflare Workers 的 KV 存储

## 常见问题

### 1. CORS 错误

确保 Cloudflare Workers 返回正确的 CORS 头部：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

### 2. 认证失败

检查：
- Supabase URL 和密钥是否正确
- JWT Token 是否正确传递
- RLS 策略是否正确配置

### 3. 实时数据不同步

确保：
- Supabase 实时功能已启用
- 客户端正确订阅了频道
- 用户有权限访问相关数据

## 性能优化建议

### 1. 数据库优化

- 为常用查询字段添加索引
- 使用 Supabase Edge Functions 处理复杂逻辑
- 实施连接池管理

### 2. 缓存策略

- 使用 Cloudflare KV 缓存频繁访问的数据
- 在 Workers 中实现响应缓存
- 优化 Supabase 查询

### 3. 前端优化

- 使用 Zustand 的选择性订阅
- 实现虚拟滚动处理大数据列表
- 优化图片和资源加载

## 扩展功能

### 1. 添加支付功能

```javascript
// 在 Cloudflare Workers 中添加支付处理
router.post('/payments', async (request, env, ctx) => {
  // 集成 Stripe 或支付宝
  const paymentIntent = await stripe.paymentIntents.create({...})
  return jsonResponse(paymentIntent)
})
```

### 2. 添加通知功能

```javascript
// 使用 Supabase 实时功能发送通知
await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    title: '新任务分配',
    body: `您被分配了新任务: ${taskTitle}`,
    type: 'task'
  })
```

### 3. 添加数据分析

```sql
-- 创建统计视图
CREATE OR REPLACE VIEW wedding_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_events,
  AVG(budget) as avg_budget,
  COUNT(DISTINCT creator_id) as unique_users
FROM events
GROUP BY DATE_TRUNC('month', created_at);
```

## 总结

通过以上步骤，你已经建立了一个完整的、可扩展的婚礼策划应用后端服务：

✅ **Supabase**: 数据库、认证、存储、实时功能  
✅ **Cloudflare Workers**: API网关、安全防护、性能优化  
✅ **前端集成**: Zustand 状态管理无缝对接  
✅ **自动化部署**: GitHub Actions CI/CD  
✅ **监控维护**: 日志、性能监控、安全检查  

这个架构具有良好的扩展性，可以根据业务需求逐步添加更多功能。