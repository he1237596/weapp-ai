const initialState = {
  tasks: [],
  currentTask: null,
  loading: false
}

const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      }
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        currentTask: state.currentTask?.id === action.payload.id
          ? action.payload
          : state.currentTask
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        currentTask: state.currentTask?.id === action.payload ? null : state.currentTask
      }
    case 'TOGGLE_TASK_STATUS':
      const { taskId, status } = action.payload
      return {
        ...state,
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
      }
    case 'SET_CURRENT_TASK':
      return {
        ...state,
        currentTask: action.payload
      }
    case 'CLEAR_CURRENT_TASK':
      return {
        ...state,
        currentTask: null
      }
    default:
      return state
  }
}

export { taskReducer }