import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import trends from './trends'

const rootReducer = combineReducers({
  trends: trends,
  routing: routerReducer
})

export default rootReducer
