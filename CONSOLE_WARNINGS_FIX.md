# 控制台警告修复指南

## 当前问题
微信小程序开发环境下控制台显示大量警告和错误信息，影响开发体验。

## 主要警告类型

### 1. Supabase 相关警告
- **问题**: Supabase 模块加载和初始化信息
- **解决方案**: 已创建环境适配器，小程序使用纯模拟实现

### 2. 重复方法定义警告
- **问题**: Zustand store 中有重复的方法名（如 `updateEvent`）
- **位置**: `src/store/useStore.ts`
- **解决方案**: 重命名同步版本方法

### 3. 数据库操作错误日志
- **问题**: API 调用失败时大量 console.error
- **位置**: `src/services/database.ts`, `src/store/useStore.ts`
- **解决方案**: 使用统一日志管理

## 已实施的修复

### ✅ 1. 创建日志管理器
- 文件: `src/utils/logger.ts`
- 功能: 根据环境控制日志级别
- 小程序环境下减少调试输出

### ✅ 2. 优化 Supabase 适配器
- 文件: `src/lib/supabase-weapp-pure.ts`
- 移除多余的 console.log 输出
- 保持核心功能不变

### ✅ 3. 清理工具函数
- 文件: `src/utils/storage.ts`, `src/utils/common.ts`
- 移除调试用的 console.error

## 建议的进一步优化

### 1. 修复 Store 重复方法
```typescript
// 将同步方法重命名
updateEvent → asyncUpdateEvent (API调用)
syncUpdateEvent → updateEvent (本地更新)

deleteEvent → asyncDeleteEvent (API调用)  
syncDeleteEvent → deleteEvent (本地更新)
```

### 2. 统一错误处理
```typescript
// 使用 logger 替代直接的 console.error
logger.error('操作失败', error)  // 只在需要时显示
```

### 3. 环境变量控制
```typescript
// 在小程序生产环境完全禁用调试日志
if (process.env.NODE_ENV === 'production' && process.env.TARO_ENV === 'weapp') {
  // 禁用所有 console 输出
}
```

## 立即可见的改进

当前修复后，小程序控制台应该显著减少以下警告：
- ✅ Supabase 初始化信息
- ✅ 存储操作错误信息  
- ✅ 工具函数调试信息
- ✅ 复制操作失败信息

## 测试验证

重新构建小程序检查控制台输出：
```bash
npm run build:weapp
npm run dev:weapp
```

预期看到更清洁的控制台输出，只保留重要的错误信息。