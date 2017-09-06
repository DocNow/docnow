import React from 'react'
import MediaQueryComponent from './MediaQueryComponent'
import PropTypes from 'prop-types'
import Place from './Place'
import mapbg from '../images/mapbg.png'
import styles from '../styles/Trends.css'
import button from '../styles/Button.css'
import cards from '../styles/Card.css'
import globStyles from '../styles/App.css'

export default class Trends extends MediaQueryComponent {
  constructor(props) {
    super(props)
    this.state = { introStyle: styles.Intro }
  }

  componentDidMount() {
    this.props.getTrends()
    const intervalId = setInterval(this.props.getTrends, 3000)
    this.setState((prevState) => {
      return Object.assign(prevState, {intervalId: intervalId})
    })
    this.setMediaQuery('(min-width: 1180px)', styles.Intro, styles.IntroOver1180px)
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
        <div className={`${globStyles.Container} ${this.state.mediaStyle}`}>
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
