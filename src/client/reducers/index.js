import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import app from './app'
import trends from './trends'
import settings from './settings'

const rootReducer = combineReducers({
  app: app,
  trends: trends,
  settings: settings,
  router: routerReducer
})

export default rootReducer
