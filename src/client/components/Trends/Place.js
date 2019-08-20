import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'
import SearchTerm from '../Explore/SearchTerm'
import '@material/react-card/index.scss'
import '@material/react-layout-grid/index.scss'

import '@material/react-icon-button/index.scss'
import IconButton from '@material/react-icon-button'

import Card, {
  CardPrimaryContent,
  CardActions,
  CardActionIcons
} from "@material/react-card"

import cardStyle from '../Card.css'
import placeStyle from './Place.css'
import searchTermStyle from '../Explore/SearchTerm.css'

export default class Place extends Component {

  createSearch(e) {
    this.props.createSearch([
      {
        type: e.parentNode.getAttribute('data-type'),
        value: e.innerText
      }
    ])
  }

  render() {
    let trends = null
    let remove = null
    if (this.props.username) {
      remove = (<IconButton 
        onClick={() => {this.props.deleteTrend(this.props.placeId)}}><ion-icon name="remove"></ion-icon></IconButton>)
      trends = this.props.trends.map((trend, i) => {
        return (
          <div key={`t-${i}`} className={placeStyle.Trend}>
            <div className={placeStyle.TrendTerm}>
              <SearchTerm
                className={searchTermStyle.InCard}
                onClick={(e) => {this.createSearch(e)}}
                value={trend.name} />
            </div>
            <div className={placeStyle.TrendCount}>
              <bdo title={trend.name + ' tweets in the last 24 hours'}>{ parseInt(trend.tweets, 10).toLocaleString() }</bdo>
            </div>
          </div>)
      })
    } else {
      trends = this.props.trends.map((trend, i) => {
        return (
          <div key={`t-${i}`} className={placeStyle.Trend}>
            <div className={placeStyle.TrendTerm}>
              { trend.name }
            </div>
            <div className={searchTermStyle.InCard}>
              <bdo>{ parseInt(trend.tweets, 10).toLocaleString() }</bdo>
            </div>
          </div>)
      })
    }

    return (
      <Card outlined className={cardStyle.Card} >
        <CardPrimaryContent className={cardStyle.Scroll}>
          <FlipMove
            style={{padding: '24px'}}
            duration={2000}
            enterAnimation="elevator"
            leaveAnimation="fade">
            { trends }
          </FlipMove>
        </CardPrimaryContent>

        <CardActions>
          <h2 className={cardStyle.PlaceHeader}>{this.props.name} </h2>
          <CardActionIcons>
            {remove}
          </CardActionIcons>
        </CardActions>
      </Card>
    )
  }
}

Place.propTypes = {
  trends: PropTypes.array,
  world: PropTypes.object,
  name: PropTypes.string,
  placeId: PropTypes.string,
  username: PropTypes.string,
  deleteTrend: PropTypes.func,
  createSearch: PropTypes.func
}
