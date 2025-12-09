import { ReactNode } from 'react'

// Event interfaces
export interface Event {
  id: string
  title: string
  icon: string
  progress: number
  startDate: string
  budget: number
  status: 'ongoing' | 'planning' | 'completed'
}

// Task interfaces  
export interface Task {
  id: string
  title: string
  status: 'pending' | 'doing' | 'completed'
  cost: number
  icon: string
  description?: string
  priority?: string
  due_date?: string
}

// State interfaces
export interface IndexState {
  events: Event[]
  searchKeyword: string
}

export interface TasksState {
  eventId: string | null
  activeTab: 'process' | 'calendar' | 'expense'
  tasks: Task[]
  loading: boolean
}

export interface EventListState {
  events: Event[]
  currentTab: number
  searchValue: string
}

// Task creation interfaces
export interface FormData {
  title: string
  description: string
  priority: 'low' | 'normal' | 'high'
}

export interface CreateTaskState {
  formData: FormData
  submitLoading: boolean
}

// Redux state interfaces
export interface RootState {
  [key: string]: any
}