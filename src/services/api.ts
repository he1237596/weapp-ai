import { supabase, cloudflareAPI, handleAPIResponse, withRetry } from '../lib/supabase'
import { useStore } from '../store/useStore'
import Taro from '@tarojs/taro'

// API 服务层 - 连接 Zustand Store 与后端服务

export class APIService {
  private static instance: APIService
  private retryConfig = { maxRetries: 3, delay: 1000 }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService()
    }
    return APIService.instance
  }

  // 用户认证相关 API
  async signIn(email: string, password: string) {
    return handleAPIResponse(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // 获取用户详细信息
      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        // 更新 store 中的用户状态
        useStore.getState().setUser(profile)
        useStore.getState().setLoading(false)
      }
      
      return data
    })
  }

  async signUp(email: string, password: string, nickname: string) {
    return handleAPIResponse(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        // 创建用户档案
        const { data: profile } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            nickname: nickname || '新用户'
          })
          .select()
          .single()
        
        // 更新 store
        useStore.getState().setUser(profile)
      }
      
      return data
    })
  }

  async signOut() {
    return handleAPIResponse(async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // 清空 store 中的用户状态
      useStore.getState().clearUser()
      
      return true
    })
  }

  async getCurrentUser() {
    return handleAPIResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null
      
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // 更新 store 中的用户状态
      useStore.getState().setUser(profile)
      
      return profile
    })
  }

  // 事件相关 API
  async loadEvents() {
    useStore.getState().setLoading(true)
    
    return handleAPIResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')
      
      // 使用 Cloudflare API 或直接查询 Supabase
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('events')
          .select(`
            *,
            event_members!inner(
              user_id,
              role
            )
          `)
          .eq('event_members.user_id', user.id)
          .order('created_at', { ascending: false })
      }, this.retryConfig.maxRetries, this.retryConfig.delay)
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().setEvents(data || [])
      useStore.getState().setLoading(false)
      
      return data
    })
  }

  async createEvent(eventData: any) {
    return handleAPIResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          creator_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      // 添加创建者为事件所有者
      await supabase
        .from('event_members')
        .insert({
          event_id: data.id,
          user_id: user.id,
          role: 'owner'
        })
      
      // 更新 store
      useStore.getState().addEvent(data)
      
      return data
    })
  }

  async updateEvent(eventId: string, updateData: any) {
    return handleAPIResponse(async () => {
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().updateEvent(data)
      
      return data
    })
  }

  async deleteEvent(eventId: string) {
    return handleAPIResponse(async () => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().deleteEvent(eventId)
      
      return true
    })
  }

  // 任务相关 API
  async loadTasks(eventId: string) {
    return handleAPIResponse(async () => {
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('tasks')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: true })
      }, this.retryConfig.maxRetries, this.retryConfig.delay)
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().setTasks(data || [])
      
      return data
    })
  }

  async createTask(taskData: any) {
    return handleAPIResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().addTask(data)
      
      return data
    })
  }

  async updateTask(taskId: string, updateData: any) {
    return handleAPIResponse(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().updateTask(data)
      
      return data
    })
  }

  async deleteTask(taskId: string) {
    return handleAPIResponse(async () => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().deleteTask(taskId)
      
      return true
    })
  }

  async toggleTaskStatus(taskId: string, status: 'pending' | 'doing' | 'completed') {
    return handleAPIResponse(async () => {
      const updateData: any = { status }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) throw error
      
      // 使用 store 的 toggleTaskStatus 方法
      useStore.getState().toggleTaskStatus(taskId, status)
      
      return data
    })
  }

  // 支出相关 API
  async loadExpenses(eventId: string) {
    return handleAPIResponse(async () => {
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('expenses')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
      }, this.retryConfig.maxRetries, this.retryConfig.delay)
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().setExpenses(data || [])
      
      return data
    })
  }

  async createExpense(expenseData: any) {
    return handleAPIResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          created_by: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().addExpense(data)
      
      return data
    })
  }

  async updateExpense(expenseId: string, updateData: any) {
    return handleAPIResponse(async () => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expenseId)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().updateExpense(data)
      
      return data
    })
  }

  async deleteExpense(expenseId: string) {
    return handleAPIResponse(async () => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().deleteExpense(expenseId)
      
      return true
    })
  }

  // 模板相关 API
  async loadTemplates() {
    return handleAPIResponse(async () => {
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('task_templates')
          .select(`
            *,
            template_tasks (*)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
      }, this.retryConfig.maxRetries, this.retryConfig.delay)
      
      if (error) throw error
      
      // 更新 store
      useStore.getState().setTemplates(data || [])
      
      return data
    })
  }

  async createTemplateFromTasks(eventId: string, templateName: string) {
    return handleAPIResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')
      
      // 先获取事件的所有任务
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', eventId)
      
      if (!tasks || tasks.length === 0) {
        throw new Error('没有可用的任务来创建模板')
      }
      
      // 创建模板
      const { data: template, error: templateError } = await supabase
        .from('task_templates')
        .insert({
          name: templateName,
          description: `基于事件 ${eventId} 的任务创建的模板`,
          created_by: user.id,
          is_public: false
        })
        .select()
        .single()
      
      if (templateError) throw templateError
      
      // 创建模板任务
      const templateTasks = tasks.map((task, index) => ({
        template_id: template.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: 'general',
        order_index: index,
        icon: task.icon
      }))
      
      const { error: tasksError } = await supabase
        .from('template_tasks')
        .insert(templateTasks)
      
      if (tasksError) throw tasksError
      
      // 更新 store
      useStore.getState().addTemplate(template)
      
      return template
    })
  }

  // 实时数据同步
  setupRealtimeSubscriptions() {
    const { data: { user } } = supabase.auth.getUser()
    if (!user) return

    // 监听用户相关的事件变化
    const channel = supabase
      .channel('user-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `creator_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Event change:', payload)
          // 重新加载事件列表
          this.loadEvents()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Task change:', payload)
          // 根据具体的任务更新来处理
          const taskId = payload.new?.id || payload.old?.id
          const currentTasks = useStore.getState().tasks
          const relatedTask = currentTasks.find(t => t.id === taskId)
          
          if (relatedTask) {
            this.loadTasks(relatedTask.event_id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // 文件上传
  async uploadFile(file: File, path: string = 'general') {
    return handleAPIResponse(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}/${user.id}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)
      
      return {
        fileName: data.path,
        publicUrl,
        size: file.size,
        type: file.type
      }
    })
  }

  // 数据统计
  async getEventStats(eventId: string) {
    return handleAPIResponse(async () => {
      const { data, error } = await supabase
        .from('calculate_event_stats')
        .select('*')
        .eq('event_uuid', eventId)
        .single()
      
      if (error) throw error
      
      return data
    })
  }
}

// 导出单例实例
export const apiService = APIService.getInstance()

// 导出默认实例
export default apiService