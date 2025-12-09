const initialState = {
  expenses: [],
  currentExpense: null,
  loading: false,
  categories: [
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
  ]
}

const expenseReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload
      }
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload]
      }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
        currentExpense: state.currentExpense?.id === action.payload.id
          ? action.payload
          : state.currentExpense
      }
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        currentExpense: state.currentExpense?.id === action.payload ? null : state.currentExpense
      }
    case 'SET_CURRENT_EXPENSE':
      return {
        ...state,
        currentExpense: action.payload
      }
    case 'CLEAR_CURRENT_EXPENSE':
      return {
        ...state,
        currentExpense: null
      }
    default:
      return state
  }
}

export { expenseReducer }