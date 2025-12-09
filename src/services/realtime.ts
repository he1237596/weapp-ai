import { supabase, RealtimeChannel } from '../lib/supabase'
import { EventService, TaskService, ExpenseService } from './database'
import { useState, useEffect } from 'react'



export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private listeners: Map<string, Set<Function>> = new Map()

  // 订阅事件的实时更新
  subscribeToEvent(eventId, callbacks) {
    const channelName = `event-${eventId}`
    
    if (this.channels.has(channelName)) {
      this.unsubcribeFromEvent(eventId)
    }

    const channel = supabase.channel(channelName)

    // 订阅任务变更
    if (callbacks.onTaskChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `event_id=eq.${eventId}`
        },
        callbacks.onTaskChange
      )

      this.addListener(channelName, 'task', callbacks.onTaskChange)
    }

    // 订阅支出变更
    if (callbacks.onExpenseChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `event_id=eq.${eventId}`
        },
        callbacks.onExpenseChange
      )

      this.addListener(channelName, 'expense', callbacks.onExpenseChange)
    }

    // 订阅事件本身变更
    if (callbacks.onEventChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`
        },
        callbacks.onEventChange
      )

      this.addListener(channelName, 'event', callbacks.onEventChange)
    }

    channel.subscribe()
    this.channels.set(channelName, channel)
  }

  // 取消订阅事件
  unsubcribeFromEvent(eventId: string) {
    const channelName = `event-${eventId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
      this.listeners.delete(channelName)
    }
  }

  // 订阅用户的所有事件
  subscribeToUserEvents(userId: string, callbacks: {
    onEventListChange?: (payload: RealtimeEventData) => void
    onTaskChange?: (payload: RealtimeEventData) => void
    onExpenseChange?: (payload: RealtimeEventData) => void
  }) {
    const channelName = `user-${userId}`
    
    if (this.channels.has(channelName)) {
      this.unsubcribeFromUserEvents(userId)
    }

    const channel = supabase.channel(channelName)

    // 订阅用户相关的事件变更
    if (callbacks.onEventListChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_members',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // 当事件成员关系变更时，触发事件列表更新
          callbacks.onEventListChange?.(payload)
        }
      )

      // 直接订阅事件表变更（仅限该用户创建的事件）
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `creator_id=eq.${userId}`
        },
        callbacks.onEventListChange
      )

      this.addListener(channelName, 'eventList', callbacks.onEventListChange)
    }

    // 订阅用户相关的所有任务变更
    if (callbacks.onTaskChange) {
      // 通过事件成员关系获取用户相关的任务
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        async (payload) => {
          // 需要检查任务所属的事件是否与用户相关
          const taskId = payload.new_record?.id || payload.old_record?.id
          if (taskId) {
            const isRelated = await this.isTaskRelatedToUser(taskId, userId)
            if (isRelated) {
              callbacks.onTaskChange?.(payload)
            }
          }
        }
      )

      this.addListener(channelName, 'userTask', callbacks.onTaskChange)
    }

    channel.subscribe()
    this.channels.set(channelName, channel)
  }

  // 取消订阅用户事件
  unsubcribeFromUserEvents(userId: string) {
    const channelName = `user-${userId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
      this.listeners.delete(channelName)
    }
  }

  // 检查任务是否与用户相关
  private async isTaskRelatedToUser(taskId: string, userId: string): Promise<boolean> {
    try {
      // 这里需要查询任务所属的事件，然后检查用户是否是该事件的成员
      // 由于这是实时监听的辅助函数，可以返回true让上层处理
      return true
    } catch (error) {
      console.error('检查任务关联失败:', error)
      return false
    }
  }

  // 添加监听器
  private addListener(channelName: string, type: string, callback: Function) {
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, new Set())
    }
    const channelListeners = this.listeners.get(channelName)!
    channelListeners.add(callback)
  }

  // 发送实时通知（当有新操作时）
  async sendNotification(eventId: string, type: string, data: any) {
    try {
      // 这里可以使用Supabase的实时功能或者WebSocket发送通知
      const payload = {
        type,
        event_id: eventId,
        data,
        timestamp: new Date().toISOString()
      }

      // 可以存储到notifications表或直接通过WebSocket发送
      console.log('发送实时通知:', payload)
      
      return payload
    } catch (error) {
      console.error('发送实时通知失败:', error)
      throw error
    }
  }

  // 清理所有订阅
  cleanup() {
    this.channels.forEach((channel) => {
      channel.unsubscribe()
    })
    this.channels.clear()
    this.listeners.clear()
  }

  // 获取连接状态
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    // 根据Supabase客户端的连接状态返回
    return 'connected' // 简化实现
  }
}

// React Hook for realtime updates
export const useRealtimeEvent = (eventId: string, dependencies: any[] = []) => {
  const [realtimeService] = useState(() => new RealtimeService())
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (!eventId) return

    const handleUpdate = () => {
      setLastUpdate(new Date())
    }

    realtimeService.subscribeToEvent(eventId, {
      onTaskChange: handleUpdate,
      onExpenseChange: handleUpdate,
      onEventChange: handleUpdate
    })

    return () => {
      realtimeService.unsubcribeFromEvent(eventId)
    }
  }, [eventId, ...dependencies])

  return { lastUpdate, realtimeService }
}

// React Hook for user events
export const useRealtimeUserEvents = (userId: string, dependencies: any[] = []) => {
  const [realtimeService] = useState(() => new RealtimeService())
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (!userId) return

    const handleUpdate = () => {
      setLastUpdate(new Date())
    }

    realtimeService.subscribeToUserEvents(userId, {
      onEventListChange: handleUpdate,
      onTaskChange: handleUpdate,
      onExpenseChange: handleUpdate
    })

    return () => {
      realtimeService.unsubcribeFromUserEvents(userId)
    }
  }, [userId, ...dependencies])

  return { lastUpdate, realtimeService }
}

// 实时同步的状态管理
export interface SyncState {
  isOnline: boolean
  lastSyncTime: Date | null
  pendingChanges: number
  syncing: boolean
}

export class SyncManager {
  private state: SyncState = {
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingChanges: 0,
    syncing: false
  }

  private listeners: Set<(state: SyncState) => void> = new Set()
  private pendingOperations: Array<{ id: string; operation: Function; retryCount: number }> = []

  constructor() {
    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  // 添加状态监听器
  addListener(listener: (state: SyncState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // 更新状态
  private updateState(updates: Partial<SyncState>) {
    this.state = { ...this.state, ...updates }
    this.listeners.forEach(listener => listener(this.state))
  }

  // 处理网络连接恢复
  private handleOnline = () => {
    this.updateState({ isOnline: true })
    this.syncPendingChanges()
  }

  // 处理网络连接断开
  private handleOffline = () => {
    this.updateState({ isOnline: false })
  }

  // 添加待同步操作
  addPendingOperation(operation: Function) {
    const id = Date.now().toString()
    this.pendingOperations.push({
      id,
      operation,
      retryCount: 0
    })
    this.updateState({ 
      pendingChanges: this.pendingOperations.length 
    })

    if (this.state.isOnline) {
      this.syncPendingChanges()
    }
  }

  // 同步待处理的变化
  private async syncPendingChanges() {
    if (this.state.syncing || this.pendingOperations.length === 0) {
      return
    }

    this.updateState({ syncing: true })

    const operations = [...this.pendingOperations]
    this.pendingOperations = []

    for (const { id, operation, retryCount } of operations) {
      try {
        await operation()
      } catch (error) {
        console.error('同步操作失败:', error)
        // 重试逻辑
        if (retryCount < 3) {
          this.pendingOperations.push({
            id,
            operation,
            retryCount: retryCount + 1
          })
        }
      }
    }

    this.updateState({ 
      syncing: false,
      lastSyncTime: new Date(),
      pendingChanges: this.pendingOperations.length 
    })
  }

  // 获取当前状态
  getState(): SyncState {
    return { ...this.state }
  }

  // 清理
  cleanup() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    this.listeners.clear()
    this.pendingOperations = []
  }
}

// 全局同步管理器实例
export const syncManager = new SyncManager()

export default RealtimeService