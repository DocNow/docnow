import { render } from 'react-dom'
import React, { Component } from 'react'
import FlipMove from 'react-flip-move'
import './app.css'

export default class App extends Component {
  
  constructor() {
    super();
    this.state = {
      created: null,
      trends: [],
    }
    this.getTrends = this.getTrends.bind(this)
  }

  getTrends() {
    fetch('/api/v1/trends')
      .then(resp => resp.json())
      .then(result => {
        this.setState({
          created: result.created,
          trends: result.trends
        })
      })
  }

  componentDidMount() {
    this.getTrends()
    var that = this
    setInterval(this.getTrends, 5000)
  }

  render() {
    const trends = this.state.trends.map(trend =>
      <li key={trend.text}>{ trend.text } [{ trend.tweets }]</li>
    )  
    return(
      <div className="App">
        { this.state.created }
        <ul>
          <FlipMove duration={1000} easing="ease-out">
            { trends }
          </FlipMove>
        </ul>
      </div>
    )
  } 
}
