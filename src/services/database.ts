import { supabase } from '../lib/supabase'

// 事件相关服务
export class EventService {
  // 获取用户的事件列表
  static async getUserEvents(userId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_members!inner(
            user_id,
            role
          )
        `)
        .eq('event_members.user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取事件列表失败:', error)
      throw error
    }
  }

  // 创建事件
  static async createEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error

      // 创建者为事件所有者
      await supabase
        .from('event_members')
        .insert({
          event_id: data.id,
          user_id: eventData.creator_id,
          role: 'owner'
        })

      return data
    } catch (error) {
      console.error('创建事件失败:', error)
      throw error
    }
  }

  // 获取事件详情
  static async getEventDetail(eventId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取事件详情失败:', error)
      throw error
    }
  }

  // 更新事件
  static async updateEvent(eventId, updateData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新事件失败:', error)
      throw error
    }
  }

  // 删除事件
  static async deleteEvent(eventId) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('删除事件失败:', error)
      throw error
    }
  }
}

// 任务相关服务
export class TaskService {
  // 获取事件的任务列表
  static async getEventTasks(eventId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取任务列表失败:', error)
      throw error
    }
  }

  // 创建任务
  static async createTask(taskData) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    }
  }

  // 更新任务
  static async updateTask(taskId, updateData) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新任务失败:', error)
      throw error
    }
  }

  // 删除任务
  static async deleteTask(taskId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('删除任务失败:', error)
      throw error
    }
  }

  // 批量创建任务（从模板）
  static async createTasksFromTemplate(eventId, templateTasks, createdBy) {
    try {
      const tasksToInsert = templateTasks.map(task => ({
        event_id: eventId,
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        due_date: task.due_date,
        created_by: createdBy
      }))

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('批量创建任务失败:', error)
      throw error
    }
  }
}

// 支出相关服务
export class ExpenseService {
  // 获取事件的支出列表
  static async getEventExpenses(eventId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取支出列表失败:', error)
      throw error
    }
  }

  // 创建支出记录
  static async createExpense(expenseData) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建支出记录失败:', error)
      throw error
    }
  }

  // 更新支出记录
  static async updateExpense(expenseId, updateData) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expenseId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新支出记录失败:', error)
      throw error
    }
  }

  // 删除支出记录
  static async deleteExpense(expenseId) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('删除支出记录失败:', error)
      throw error
    }
  }

  // 获取支出统计
  static async getExpenseStats(eventId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('event_id', eventId)

      if (error) throw error

      const total = data?.reduce((sum, expense) => sum + expense.amount, 0) || 0
      
      const byCategory = data?.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {}) || {}

      return {
        total,
        byCategory,
        count: data?.length || 0
      }
    } catch (error) {
      console.error('获取支出统计失败:', error)
      throw error
    }
  }
}

// 用户相关服务
export class UserService {
  // 获取用户信息
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 更新用户信息
  static async updateUserProfile(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  // 创建用户档案
  static async createUserProfile(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建用户档案失败:', error)
      throw error
    }
  }
}

// 模板相关服务
export class TemplateService {
  // 获取任务模板列表
  static async getTaskTemplates() {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('获取任务模板失败:', error)
      throw error
    }
  }

  // 创建任务模板
  static async createTaskTemplate(templateData) {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .insert(templateData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建任务模板失败:', error)
      throw error
    }
  }
}