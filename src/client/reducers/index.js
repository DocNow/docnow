import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import settings from './settings'
import user from './user'
import trends from './trends'
import search from './search'
import searches from './searches'

const rootReducer = combineReducers({
  settings,
  user,
  trends,
  search,
  searches,
  router: routerReducer
})

export default rootReducer
