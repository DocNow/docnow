import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Place from './Place'
import mapbg from '../images/mapbg.png'
import styles from './Trends.css'
import button from './Button.css'
import cards from './Card.css'

export default class Trends extends Component {

  componentDidMount() {
    this.props.getTrends()
    const intervalId = setInterval(this.props.getTrends, 3000)
    this.setState({intervalId: intervalId})
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
    this.setState({intervalId: null})
  }

  render() {
    const loggedIn = this.props.username ? true : false
    let intro = null
    if (!loggedIn) {
      intro = (
        <div className={'container ' + styles.Intro}>
          <login>
            <intro-p>Welcome to DocNow, an app built to appraise social media content for potential collection.
              <a href="http://docnow.io">Learn more.</a>
            </intro-p>
            <button className={button.Button} onClick={() => {window.location = '/auth/twitter'; return false}}>
              <i className="fa fa-twitter" aria-hidden="true"/>  Login with Twitter
            </button>
          <a href="/">Request an Account</a>
          </login>
        </div>
      )
    }

    return (
      <div>
        {intro}
        <trends className={styles.Trends} style={{backgroundImage: `url(${mapbg})`}}>
          <cardholder className={cards.Cardholder}>
            {this.props.trends.map(place => (
              <Place
                key={place.name}
                trends={place.trends}
                placeId={place.placeId}
                name={place.name}
                world={this.props.world}
                deleteTrend={this.props.deleteTrend}
                updateNewTrend={this.props.updateNewTrend}
                placeLabelToId={this.props.placeLabelToId}
                saveTrends={this.props.saveTrends}
                username={this.props.username} />
            ))}
          </cardholder>
        </trends>
      </div>
    )
  }
}

Trends.propTypes = {
  username: PropTypes.string,
  trends: PropTypes.array,
  getTrends: PropTypes.func,
  world: PropTypes.object,
  updateNewTrend: PropTypes.func,
  newPlace: PropTypes.string,
  placeLabelToId: PropTypes.func,
  deleteTrend: PropTypes.func,
  saveTrends: PropTypes.func
}
