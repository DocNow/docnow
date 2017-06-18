import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Place from './Place'
import '../images/dn.png'
import styles from './Trends.css'

export default class Trends extends Component {

  componentDidMount() {
    this.props.getPlaces()
    const intervalId = setInterval(this.props.getPlaces, 3000)
    this.setState({intervalId: intervalId})
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
    this.setState({intervalId: null})
  }

  render() {
    return (
      <div className={styles.Trends}>
        {this.props.places.map(place =>
          <Place key={place.name} trends={place.trends} name={place.name} />
        )}
      </div>
    )
  }

}

Trends.propTypes = {
  places: PropTypes.array,
  getPlaces: PropTypes.func,
}
