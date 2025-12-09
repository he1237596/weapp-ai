const initialState = {
  user: null,
  loading: false,
  settings: {
    theme: 'light',
    notifications: true,
    autoBackup: true
  }
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    case 'CLEAR_USER':
      return {
        ...state,
        user: null
      }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    default:
      return state
  }
}

export { userReducer }