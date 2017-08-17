import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import settings from './settings'
import user from './user'
import trends from './trends'
import search from './search'

const rootReducer = combineReducers({
  settings,
  user,
  trends,
  search,
  router: routerReducer
})

export default rootReducer
