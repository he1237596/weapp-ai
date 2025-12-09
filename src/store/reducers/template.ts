const initialState = {
  templates: [],
  currentTemplate: null,
  loading: false
}

const templateReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_TEMPLATES':
      return {
        ...state,
        templates: action.payload
      }
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.payload]
      }
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
        currentTemplate: state.currentTemplate?.id === action.payload.id
          ? action.payload
          : state.currentTemplate
      }
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload),
        currentTemplate: state.currentTemplate?.id === action.payload ? null : state.currentTemplate
      }
    case 'SET_CURRENT_TEMPLATE':
      return {
        ...state,
        currentTemplate: action.payload
      }
    case 'CLEAR_CURRENT_TEMPLATE':
      return {
        ...state,
        currentTemplate: null
      }
    default:
      return state
  }
}

export { templateReducer }