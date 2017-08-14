import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'
import styles from './Place.css'
import { Link } from 'react-router-dom'

export default class Place extends Component {
  render() {
    let trends = null
    let remove = null
    if (this.props.username) {
      remove = <button onClick={()=>{this.props.deleteTrend(this.props.placeId)}}>x</button>
      trends = this.props.trends.slice(0, 10).map(trend =>
        <li key={ trend.name + trend.text }><Link to={'/search/' + encodeURIComponent(trend.name)}>{ trend.name }</Link> [{ trend.tweets }]</li>
      )
    } else {
      trends = this.props.trends.slice(0, 10).map(trend =>
        <li key={ trend.name + trend.text }>{ trend.name } [{ trend.tweets }]</li>
      )
    }

    return (
      <div className={styles.Place}>
        <h3>{ this.props.name } {remove}</h3>
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
  username: PropTypes.string,
  deleteTrend: PropTypes.func
}
