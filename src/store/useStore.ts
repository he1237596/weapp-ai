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
  setCurrentEvent: (event: Event | null) => void
  clearCurrentEvent: () => void

  // Task actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  setCurrentTask: (task: Task | null) => void
  clearCurrentTask: () => void

  // Community actions
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  setCurrentPost: (post: Post | null) => void
  clearCurrentPost: () => void
  likePost: (postId: string) => void
  unlikePost: (postId: string) => void

  // Expense actions
  setExpenses: (expenses: Expense[]) => void
  addExpense: (expense: Expense) => void
  setCurrentExpense: (expense: Expense | null) => void
  clearCurrentExpense: () => void

  // Template actions
  setTemplates: (templates: Template[]) => void
  addTemplate: (template: Template) => void
  setCurrentTemplate: (template: Template | null) => void
  clearCurrentTemplate: () => void

  // API actions - 集成后端服务（这些方法在接口中声明，但实际实现由 apiService 处理）
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

  // API actions implementation (已由 apiService 处理，无需重复实现)
}))