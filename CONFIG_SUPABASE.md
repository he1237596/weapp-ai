# Supabase 配置指南

## 问题说明
在微信小程序环境中，`process.env` 不可用，因此需要手动配置 Supabase 连接信息。

## 解决方案

### 方法一：修改 supabase.ts（推荐）
编辑 `src/lib/supabase.ts` 文件，将配置信息替换为你的实际值：

```typescript
const supabaseUrl = 'https://你的项目ID.supabase.co'
const supabaseAnonKey = '你的匿名密钥'
```

### 方法二：创建配置文件
创建 `src/config/supabase-config.ts`：

```typescript
export const SUPABASE_CONFIG = {
  url: 'https://你的项目ID.supabase.co',
  anonKey: '你的匿名密钥'
}
```

然后在 `src/lib/supabase.ts` 中导入：

```typescript
import { SUPABASE_CONFIG } from '../config/supabase-config'

const supabaseUrl = SUPABASE_CONFIG.url
const supabaseAnonKey = SUPABASE_CONFIG.anonKey
```

## 获取配置信息

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 Settings > API
4. 复制 Project URL 和 anon public key

## 注意事项

- 不要在代码中暴露 Service Role Key
- 生产环境建议使用环境变量管理配置
- 可以根据不同环境（开发/生产）使用不同的配置

## 测试连接

配置完成后，可以在浏览器控制台测试：

```javascript
import { supabase } from './lib/supabase'

// 测试连接
supabase.from('test').select('*').then(console.log)
```