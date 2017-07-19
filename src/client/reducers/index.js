import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import settings from './settings'
import user from './user'
import places from './places'
import trends from './trends'

const rootReducer = combineReducers({
  settings: settings,
  user: user,
  places: places,
  trends: trends,
  router: routerReducer
})

export default rootReducer
