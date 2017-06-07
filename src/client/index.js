import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import store, { history } from './store'
import App from './containers/App'
import { getTrends } from './actions/trends'

if (module.hot) {
  module.hot.accept()
}

const target = document.querySelector('#app')

setInterval(() => store.dispatch(getTrends()), 2000)

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App/>
    </ConnectedRouter>
  </Provider>,
  target
)
