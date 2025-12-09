const initialState = {
  events: [],
  currentEvent: null,
  loading: false
}

const eventReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload
      }
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload]
      }
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
        currentEvent: state.currentEvent?.id === action.payload.id
          ? action.payload
          : state.currentEvent
      }
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        currentEvent: state.currentEvent?.id === action.payload ? null : state.currentEvent
      }
    case 'SET_CURRENT_EVENT':
      return {
        ...state,
        currentEvent: action.payload
      }
    case 'CLEAR_CURRENT_EVENT':
      return {
        ...state,
        currentEvent: null
      }
    default:
      return state
  }
}

export { eventReducer }