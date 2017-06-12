import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import trends from './trends'

const rootReducer = combineReducers({
  trends: trends,
  router: routerReducer
})

export default rootReducer
