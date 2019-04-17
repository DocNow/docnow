import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import { createBrowserHistory } from 'history'
import createRootReducer from './reducers'

export const history = createBrowserHistory()

const initialState = {}
const enhancers = []
const middleware = [
  routerMiddleware(history),
  thunk
]

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
)

const store = createStore(
  createRootReducer(history),
  initialState,
  composedEnhancers
)

export default store
