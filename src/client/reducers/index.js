import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import settings from './settings'
import user from './user'
import trends from './trends'
import search from './search'
import searches from './searches'
import users from './users'
import webpages from './webpages'
import queue from './queue'
import tweets from './tweets'
import stats from './stats'

export default (history) => combineReducers({
  settings,
  user,
  trends,
  search,
  searches,
  users,
  webpages,
  queue,
  tweets,
  stats,
  router: connectRouter(history)
})