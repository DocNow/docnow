import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import trends from './trends'
import settings from './settings'

const rootReducer = combineReducers({
  trends: trends,
  settings: settings,
  router: routerReducer
})

export default rootReducer
