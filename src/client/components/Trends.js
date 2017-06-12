import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Place from './Place'
import '../images/dn.png'
import styles from './Trends.css'

export default class Trends extends Component {

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
  places: PropTypes.array
}
