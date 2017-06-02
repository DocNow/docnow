import React, { Component } from 'react'
import Place from './Place'
import '../images/dn.png'
import styles from './Trends.css'

export default class Trends extends Component {

  constructor() {
    super()
    this.state = {places: []}
    this.getTrends = this.getTrends.bind(this)
  }

  componentDidMount() {
    this.getTrends()
    const that = this
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
    return (
      <div className={styles.Trends}>
        {this.state.places.map(place =>
          <Place key={place.name} trends={place.trends} name={place.name} />
        )}
      </div>
    )
  }

}
