import React, { Component } from 'react'
import FlipMove from 'react-flip-move'
import './app.css'

export default class App extends Component {

  constructor() {
    super();
    this.state = {places: []}
    this.getTrends = this.getTrends.bind(this)
  }

  componentDidMount() {
    this.getTrends()
    var that = this
    setInterval(that.getTrends, 5000)
  }

  getTrends() {
    fetch('/api/v1/trends')
      .then(resp => resp.json())
      .then(result => {
        this.setState({places: result.places})
      })
  }

  render() {
    return(
      <div className="App">
        {this.state.places.map(place => 
          <Place key={place.name} trends={place.trends} name={place.name} />
        )}
      </div>
    )
  }

}

class Place extends Component {
  render() {
    const trends = this.props.trends.slice(0, 10).map(trend =>
      <li key={ trend.name + trend.text }>{ trend.text } [{ trend.tweets }]</li>
    )
    return(
      <div className="Place">
        <h3>{ this.props.name }</h3>
        <hr />
        <ul>
          <FlipMove 
            duration={1000} 
            enterAnimation="elevator"
            leaveAnimation="fade">
            { trends }
          </FlipMove>
        </ul>
      </div>
    )
  } 
}
