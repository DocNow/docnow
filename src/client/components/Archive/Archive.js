import React from 'react'
import MediaQueryComponent from '../MediaQueryComponent'
import { HashRouter as Router, Route } from "react-router-dom"

import InsightsBody from '../Insights/InsightsBody'

import data from './data'
import webpages from './webpages'

import styles from '../../containers/App.css'

class App extends MediaQueryComponent {

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', styles.App, styles.AppUnder780px)
  }

  render() {
    return (
      <div id="App" className={this.state.mediaStyle}>
        <main>
          <Router>
            <Route exact name="trends" path="/" component={() => <InsightsBody
                searchId="archived"
                search={data}
                webpages={webpages}
              />} />

          </Router>
        </main>
      </div>
    )
  }
}

export default App
