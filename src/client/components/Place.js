import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'
import { Link } from 'react-router-dom'
import card from '../styles/Card.css'

export default class Place extends Component {
  render() {
    let trends = null
    let remove = null
    if (this.props.username) {
      remove = (
        <a href="#" onClick={(e)=>{e.preventDefault(); this.props.deleteTrend(this.props.placeId)}}><i className="fa fa-minus" aria-hidden="true"/></a>
      )
      trends = this.props.trends.slice(0, 8).map(trend => <li key={ trend.name + trend.text }><Link to={'/search/' + encodeURIComponent(trend.name)}>{ trend.name }</Link> { trend.tweets }</li>
      )
    } else {
      trends = this.props.trends.slice(0, 8).map(trend =>
        <li key={ trend.name + trend.text }>{ trend.name } { trend.tweets }</li>
      )
    }

    return (
      <div className={card.Card}>
        <div className={card.Data}>
          <FlipMove
            duration={2000}
            enterAnimation="elevator"
            leaveAnimation="fade">
            { trends }
          </FlipMove>
        </div>
        <div className={card.CardTitle}>
          <h2>{this.props.name}</h2>
          {remove}
        </div>
      </div>
    )
  }
}

Place.propTypes = {
  trends: PropTypes.array,
  world: PropTypes.object,
  name: PropTypes.string,
  placeId: PropTypes.string,
  username: PropTypes.string,
  deleteTrend: PropTypes.func
}
