import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'
import { Link } from 'react-router-dom'
import styles from './Card.css'

export default class Place extends Component {
  render() {
    let trends = null
    let remove = null
    if (this.props.username) {
      remove = <button onClick={()=>{this.props.deleteTrend(this.props.placeId)}}>x</button>
      trends = this.props.trends.slice(0, 8).map(trend =>
        <li key={ trend.name + trend.text }><Link to={'/search/' + encodeURIComponent(trend.name)}>{ trend.name }</Link> [{ trend.tweets }]</li>
      )
    } else {
      trends = this.props.trends.slice(0, 8).map(trend =>
        <li key={ trend.name + trend.text }>{ trend.name } { trend.tweets }</li>
      )
    }

    return (
      <card className={styles.Card}>
        <data>
          <FlipMove
            duration={2000}
            enterAnimation="elevator"
            leaveAnimation="fade">
            { trends }
          </FlipMove>
        </data>
        <div className={styles.Cardcontainer}>
        <h2>{this.props.name} {remove}</h2>
        </div>
      </card>
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
