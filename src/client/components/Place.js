import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'
import styles from './Place.css'

export default class Place extends Component {
  render() {
    const trends = this.props.trends.slice(0, 10).map(trend =>
      <li key={ trend.name + trend.text }>{ trend.name } [{ trend.tweets }]</li>
    )
    return (
      <div className={styles.Place}>
        <h3>{ this.props.name }</h3>
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
  name: PropTypes.string
}
