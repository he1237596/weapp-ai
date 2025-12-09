// 小程序兼容的 Supabase 客户端 - 使用本地存储替代
// 由于小程序环境不支持浏览器API，我们提供一个模拟的客户端

// 模拟的 Supabase 客户端类
class SupabaseClient {
  constructor(url, key, options) {
    this.url = url
    this.key = key
    this.options = options
  }

  from(tableName) {
    return new TableQuery(tableName)
  }

  get realtime() {
    return {
      disconnect: () => {}
    }
  }
}

// 模拟的查询类
class TableQuery {
  constructor(tableName) {
    this.tableName = tableName
    this.filters = []
  }

  select(columns = '*') {
    this.columns = columns
    return this
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value })
    return this
  }

  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false }
    return this
  }

  async single() {
    const data = await this._executeQuery()
    return data ? { data: data[0] || null, error: null } : { data: null, error: new Error('Not found') }
  }

  async then(resolve, reject) {
    try {
      const result = await this._executeQuery()
      resolve({ data: result, error: null })
    } catch (error) {
      reject({ data: null, error })
    }
  }

  async _executeQuery() {
    // 返回模拟数据
    switch (this.tableName) {
      case 'events':
        return [{
          id: '1',
          title: '婚礼准备',
          budget: 56000,
          start_date: '2025-02-01'
        }]
      case 'expenses':
        return [
          { id: '1', category: 'hotel', amount: 5000, title: '酒店订金', created_at: '2025-02-15T00:00:00Z' },
          { id: '2', category: 'clothing', amount: 3200, title: '婚纱定制', created_at: '2025-02-20T00:00:00Z' },
          { id: '3', category: 'photography', amount: 2800, title: '拍婚纱照', created_at: '2025-02-25T00:00:00Z' }
        ]
      default:
        return []
    }
  }
}

// 创建模拟的 Supabase 客户端
export const supabase = new SupabaseClient(
  'https://your-project-id.supabase.co',
  'your-anon-key',
  {}
)

export default supabase