import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'
import styles from './Place.css'

export default class Place extends Component {
  render() {
    const trends = this.props.trends.slice(0, 10).map(trend =>
      <li key={ trend.name + trend.text }>{ trend.name } [{ trend.tweets }]</li>
    )
    let removeBtn = null
    if (this.props.isUserPlace) {
      removeBtn = <button onClick={()=>{this.props.deletePlace(this.props.placeId)}}>x</button>
    }
    return (
      <div className={styles.Place}>
        <h3>{ this.props.name } {removeBtn}</h3>
        <hr />
        <ul>
          <FlipMove
            duration={2000}
            enterAnimation="elevator"
            leaveAnimation="fade">
            { trends }
          </FlipMove>
        </ul>
      </div>
    )
  }
}

Place.propTypes = {
  trends: PropTypes.array,
  name: PropTypes.string,
  placeId: PropTypes.string,
  isUserPlace: PropTypes.bool,
  deletePlace: PropTypes.func
}
