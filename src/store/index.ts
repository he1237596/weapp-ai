import { createStore } from 'redux'
import { RootState } from '../types'

const rootReducer = (state = {}, action) => {
  return {
    ...state
  }
}

const store = createStore(rootReducer)

export default store