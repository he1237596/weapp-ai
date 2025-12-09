import { create } from 'zustand'
import { Event, Task } from '../types'
import { apiService } from '../services/api'
import { RealtimeService } from '../services/realtime'

// 定义所有接口类型
export interface User {
  id?: string
  name: string
  avatar: string
  phone: string
  email: string
}

export interface Settings {
  theme: 'light' | 'dark'
  notifications: boolean
  autoBackup: boolean
}

export interface Post {
  id: string
  title: string
  content: string
  author: string
  likes: number
  createdAt: string
}

export interface Expense {
  id: string
  eventId: string
  amount: number
  category: string
  description: string
  date: string
}

export interface ExpenseCategory {
  id: string
  name: string
  icon: string
}

export interface Template {
  id: string
  name: string
  description: string
  tasks: Task[]
  isPublic: boolean
  createdAt: string
}

// Zustand Store 接口
export interface AppStore {
  // User state
  user: User | null
  loading: boolean
  settings: Settings
  
  // Event state
  events: Event[]
  currentEvent: Event | null
  
  // Task state
  tasks: Task[]
  currentTask: Task | null
  
  // Community state
  posts: Post[]
  currentPost: Post | null
  
  // Expense state
  expenses: Expense[]
  currentExpense: Expense | null
  expenseCategories: ExpenseCategory[]
  
  // Template state
  templates: Template[]
  currentTemplate: Template | null

  // User actions
  setLoading: (loading: boolean) => void
  setUser: (user: User | null) => void
  updateUser: (userData: Partial<User>) => void
  clearUser: () => void
  updateSettings: (settings: Partial<Settings>) => void

  // Event actions
  setEvents: (events: Event[]) => void
  addEvent: (event: Event) => void
  updateEvent: (event: Event) => void
  deleteEvent: (eventId: string) => void
  setCurrentEvent: (event: Event | null) => void
  clearCurrentEvent: () => void

  // Task actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  deleteTask: (taskId: string) => void
  setCurrentTask: (task: Task | null) => void
  clearCurrentTask: () => void
  toggleTaskStatus: (taskId: string, status: Task['status']) => void

  // Community actions
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (post: Post) => void
  deletePost: (postId: string) => void
  setCurrentPost: (post: Post | null) => void
  clearCurrentPost: () => void
  likePost: (postId: string) => void
  unlikePost: (postId: string) => void

  // Expense actions
  setExpenses: (expenses: Expense[]) => void
  addExpense: (expense: Expense) => void
  updateExpense: (expense: Expense) => void
  deleteExpense: (expenseId: string) => void
  setCurrentExpense: (expense: Expense | null) => void
  clearCurrentExpense: () => void

  // Template actions
  setTemplates: (templates: Template[]) => void
  addTemplate: (template: Template) => void
  updateTemplate: (template: Template) => void
  deleteTemplate: (templateId: string) => void
  setCurrentTemplate: (template: Template | null) => void
  clearCurrentTemplate: () => void

  // API actions - 集成后端服务
  loadUser: () => Promise<void>
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, nickname: string) => Promise<any>
  signOut: () => Promise<boolean>
  
  loadEvents: () => Promise<void>
  createEvent: (eventData: any) => Promise<any>
  updateEvent: (eventId: string, updateData: any) => Promise<any>
  deleteEvent: (eventId: string) => Promise<boolean>
  
  loadTasks: (eventId: string) => Promise<void>
  createTask: (taskData: any) => Promise<any>
  updateTask: (taskId: string, updateData: any) => Promise<any>
  deleteTask: (taskId: string) => Promise<boolean>
  toggleTaskStatus: (taskId: string, status: Task['status']) => Promise<any>
  
  loadExpenses: (eventId: string) => Promise<void>
  createExpense: (expenseData: any) => Promise<any>
  updateExpense: (expenseId: string, updateData: any) => Promise<any>
  deleteExpense: (expenseId: string) => Promise<boolean>
  
  loadTemplates: () => Promise<void>
  createTemplateFromTasks: (eventId: string, templateName: string) => Promise<any>
  
  uploadFile: (file: File, path?: string) => Promise<any>
  
  // Realtime actions
  setupRealtime: () => (() => void) | void
}

// 创建 Zustand store
export const useStore = create<AppStore>((set, get) => ({
  // 初始状态 - User
  user: null,
  loading: false,
  settings: {
    theme: 'light',
    notifications: true,
    autoBackup: true
  },

  // 初始状态 - Event
  events: [],
  currentEvent: null,

  // 初始状态 - Task
  tasks: [],
  currentTask: null,

  // 初始状态 - Community
  posts: [],
  currentPost: null,

  // 初始状态 - Expense
  expenses: [],
  currentExpense: null,
  expenseCategories: [
    { id: 'venue', name: '场地', icon: '🏢' },
    { id: 'catering', name: '餐饮', icon: '🍽️' },
    { id: 'photography', name: '摄影', icon: '📸' },
    { id: 'clothing', name: '服装', icon: '👗' },
    { id: 'decoration', name: '装饰', icon: '🎨' },
    { id: 'transportation', name: '交通', icon: '🚗' },
    { id: 'accommodation', name: '住宿', icon: '🏨' },
    { id: 'entertainment', name: '娱乐', icon: '🎵' },
    { id: 'gift', name: '礼品', icon: '🎁' },
    { id: 'other', name: '其他', icon: '📦' }
  ],

  // 初始状态 - Template
  templates: [],
  currentTemplate: null,

  // User actions
  setLoading: (loading: boolean) => set({ loading }),
  
  setUser: (user: User | null) => set({ user }),
  
  updateUser: (userData: Partial<User>) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null
  })),
  
  clearUser: () => set({ user: null }),
  
  updateSettings: (newSettings: Partial<Settings>) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  // Event actions
  setEvents: (events: Event[]) => set({ events }),
  
  addEvent: (event: Event) => set((state) => ({
    events: [...state.events, event]
  })),
  
  updateEvent: (event: Event) => set((state) => ({
    events: state.events.map(e => e.id === event.id ? event : e),
    currentEvent: state.currentEvent?.id === event.id ? event : state.currentEvent
  })),
  
  deleteEvent: (eventId: string) => set((state) => ({
    events: state.events.filter(e => e.id !== eventId),
    currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent
  })),
  
  setCurrentEvent: (event: Event | null) => set({ currentEvent: event }),
  
  clearCurrentEvent: () => set({ currentEvent: null }),

  // Task actions
  setTasks: (tasks: Task[]) => set({ tasks }),
  
  addTask: (task: Task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  
  updateTask: (task: Task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t),
    currentTask: state.currentTask?.id === task.id ? task : state.currentTask
  })),
  
  deleteTask: (taskId: string) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== taskId),
    currentTask: state.currentTask?.id === taskId ? null : state.currentTask
  })),
  
  setCurrentTask: (task: Task | null) => set({ currentTask: task }),
  
  clearCurrentTask: () => set({ currentTask: null }),
  
  toggleTaskStatus: (taskId: string, status: Task['status']) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined
          }
        : task
    ),
    currentTask: state.currentTask?.id === taskId
      ? { 
          ...state.currentTask, 
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined
        }
      : state.currentTask
  })),

  // Community actions
  setPosts: (posts: Post[]) => set({ posts }),
  
  addPost: (post: Post) => set((state) => ({
    posts: [post, ...state.posts]
  })),
  
  updatePost: (post: Post) => set((state) => ({
    posts: state.posts.map(p => p.id === post.id ? post : p),
    currentPost: state.currentPost?.id === post.id ? post : state.currentPost
  })),
  
  deletePost: (postId: string) => set((state) => ({
    posts: state.posts.filter(p => p.id !== postId),
    currentPost: state.currentPost?.id === postId ? null : state.currentPost
  })),
  
  setCurrentPost: (post: Post | null) => set({ currentPost: post }),
  
  clearCurrentPost: () => set({ currentPost: null }),
  
  likePost: (postId: string) => set((state) => ({
    posts: state.posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ),
    currentPost: state.currentPost?.id === postId
      ? { ...state.currentPost, likes: state.currentPost.likes + 1 }
      : state.currentPost
  })),
  
  unlikePost: (postId: string) => set((state) => ({
    posts: state.posts.map(post =>
      post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post
    ),
    currentPost: state.currentPost?.id === postId
      ? { ...state.currentPost, likes: Math.max(0, state.currentPost.likes - 1) }
      : state.currentPost
  })),

  // Expense actions
  setExpenses: (expenses: Expense[]) => set({ expenses }),
  
  addExpense: (expense: Expense) => set((state) => ({
    expenses: [...state.expenses, expense]
  })),
  
  updateExpense: (expense: Expense) => set((state) => ({
    expenses: state.expenses.map(e => e.id === expense.id ? expense : e),
    currentExpense: state.currentExpense?.id === expense.id ? expense : state.currentExpense
  })),
  
  deleteExpense: (expenseId: string) => set((state) => ({
    expenses: state.expenses.filter(e => e.id !== expenseId),
    currentExpense: state.currentExpense?.id === expenseId ? null : state.currentExpense
  })),
  
  setCurrentExpense: (expense: Expense | null) => set({ currentExpense: expense }),
  
  clearCurrentExpense: () => set({ currentExpense: null }),

  // Template actions
  setTemplates: (templates: Template[]) => set({ templates }),
  
  addTemplate: (template: Template) => set((state) => ({
    templates: [...state.templates, template]
  })),
  
  updateTemplate: (template: Template) => set((state) => ({
    templates: state.templates.map(t => t.id === template.id ? template : t),
    currentTemplate: state.currentTemplate?.id === template.id ? template : state.currentTemplate
  })),
  
  deleteTemplate: (templateId: string) => set((state) => ({
    templates: state.templates.filter(t => t.id !== templateId),
    currentTemplate: state.currentTemplate?.id === templateId ? null : state.currentTemplate
  })),
  
  setCurrentTemplate: (template: Template | null) => set({ currentTemplate: template }),
  
  clearCurrentTemplate: () => set({ currentTemplate: null }),

  // API actions implementation
  loadUser: async () => {
    try {
      const { data, error } = await apiService.getCurrentUser()
      if (error) {
        console.error('加载用户失败:', error)
        return
      }
      // getCurrentUser 已经在内部调用了 setUser
    } catch (error) {
      console.error('加载用户出错:', error)
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await apiService.signIn(email, password)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },

  signUp: async (email: string, password: string, nickname: string) => {
    try {
      const { data, error } = await apiService.signUp(email, password, nickname)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      const { data, error } = await apiService.signOut()
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    }
  },

  loadEvents: async () => {
    try {
      const { data, error } = await apiService.loadEvents()
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('加载事件失败:', error)
      throw error
    }
  },

  createEvent: async (eventData: any) => {
    try {
      const { data, error } = await apiService.createEvent(eventData)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('创建事件失败:', error)
      throw error
    }
  },

  updateEvent: async (eventId: string, updateData: any) => {
    try {
      const { data, error } = await apiService.updateEvent(eventId, updateData)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('更新事件失败:', error)
      throw error
    }
  },

  deleteEvent: async (eventId: string) => {
    try {
      const { data, error } = await apiService.deleteEvent(eventId)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('删除事件失败:', error)
      throw error
    }
  },

  loadTasks: async (eventId: string) => {
    try {
      const { data, error } = await apiService.loadTasks(eventId)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('加载任务失败:', error)
      throw error
    }
  },

  createTask: async (taskData: any) => {
    try {
      const { data, error } = await apiService.createTask(taskData)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    }
  },

  updateTask: async (taskId: string, updateData: any) => {
    try {
      const { data, error } = await apiService.updateTask(taskId, updateData)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('更新任务失败:', error)
      throw error
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const { data, error } = await apiService.deleteTask(taskId)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('删除任务失败:', error)
      throw error
    }
  },

  toggleTaskStatus: async (taskId: string, status: Task['status']) => {
    try {
      const { data, error } = await apiService.toggleTaskStatus(taskId, status)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('切换任务状态失败:', error)
      throw error
    }
  },

  loadExpenses: async (eventId: string) => {
    try {
      const { data, error } = await apiService.loadExpenses(eventId)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('加载支出失败:', error)
      throw error
    }
  },

  createExpense: async (expenseData: any) => {
    try {
      const { data, error } = await apiService.createExpense(expenseData)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('创建支出失败:', error)
      throw error
    }
  },

  updateExpense: async (expenseId: string, updateData: any) => {
    try {
      const { data, error } = await apiService.updateExpense(expenseId, updateData)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('更新支出失败:', error)
      throw error
    }
  },

  deleteExpense: async (expenseId: string) => {
    try {
      const { data, error } = await apiService.deleteExpense(expenseId)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('删除支出失败:', error)
      throw error
    }
  },

  loadTemplates: async () => {
    try {
      const { data, error } = await apiService.loadTemplates()
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('加载模板失败:', error)
      throw error
    }
  },

  createTemplateFromTasks: async (eventId: string, templateName: string) => {
    try {
      const { data, error } = await apiService.createTemplateFromTasks(eventId, templateName)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('创建模板失败:', error)
      throw error
    }
  },

  uploadFile: async (file: File, path?: string) => {
    try {
      const { data, error } = await apiService.uploadFile(file, path)
      if (error) {
        throw error
      }
      return data
    } catch (error) {
      console.error('上传文件失败:', error)
      throw error
    }
  },

  setupRealtime: () => {
    try {
      return apiService.setupRealtimeSubscriptions()
    } catch (error) {
      console.error('设置实时同步失败:', error)
    }
  }
}))