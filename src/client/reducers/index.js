import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import settings from './settings'
import user from './user'
import trends from './trends'
import search from './search'
import searches from './searches'
import webpages from './webpages'
import queue from './queue'
import tweets from './tweets'

const rootReducer = combineReducers({
  settings,
  user,
  trends,
  search,
  searches,
  webpages,
  queue,
  tweets,
  router: routerReducer
})

export default rootReducer
