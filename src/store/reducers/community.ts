const initialState = {
  posts: [],
  currentPost: null,
  loading: false
}

const communityReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_POSTS':
      return {
        ...state,
        posts: action.payload
      }
    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      }
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
        currentPost: state.currentPost?.id === action.payload.id
          ? action.payload
          : state.currentPost
      }
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
        currentPost: state.currentPost?.id === action.payload ? null : state.currentPost
      }
    case 'SET_CURRENT_POST':
      return {
        ...state,
        currentPost: action.payload
      }
    case 'CLEAR_CURRENT_POST':
      return {
        ...state,
        currentPost: null
      }
    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, likes: post.likes + 1 }
            : post
        ),
        currentPost: state.currentPost?.id === action.payload
          ? { ...state.currentPost, likes: state.currentPost.likes + 1 }
          : state.currentPost
      }
    case 'UNLIKE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, likes: Math.max(0, post.likes - 1) }
            : post
        ),
        currentPost: state.currentPost?.id === action.payload
          ? { ...state.currentPost, likes: Math.max(0, state.currentPost.likes - 1) }
          : state.currentPost
      }
    default:
      return state
  }
}

export { communityReducer }