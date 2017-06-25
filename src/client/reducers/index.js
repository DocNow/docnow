import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import settings from './settings'
import user from './user'
import trends from './trends'

const rootReducer = combineReducers({
  settings: settings,
  user: user,
  trends: trends,
  router: routerReducer
})

export default rootReducer
