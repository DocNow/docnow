import React from 'react'
import MediaQueryComponent from '../MediaQueryComponent'
import PropTypes from 'prop-types'
import Place from './Place'
import AddPlace from './AddPlace'
import Intro from '../Intro'

import card from '../Card.css'
import style from './Trends.css'

import Button from '@material-ui/core/Button'

export default class Trends extends MediaQueryComponent {

  componentDidMount() {
    this.props.getTrends()
    const intervalId = setInterval(this.props.getTrends, 60000)
    this.setState((prevState) => {
      return Object.assign(prevState, {intervalId: intervalId})
    })
    this.setMediaQuery('(max-width: 780px)', style.Trends, style.Mobile)
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
    this.setState({intervalId: null})
  }

  render() {
    const loggedIn = this.props.username ? true : false
    let introElement = null
    let newLocation = null
    if (!loggedIn) {
      introElement = (
        <>
        <Intro>
          Welcome to DocNow, a social media appraisal tool.
        </Intro>
          <div className={style.Login}>
            <Button
              variant="contained" color="primary"
              onClick={() => {window.location = '/auth/twitter'; return false}}>
              <ion-icon name="logo-twitter"></ion-icon> &nbsp; Login with Twitter
            </Button>
          </div>
        </>
      )
    } else {
      introElement = (
        <Intro>
          Add a Twitter Place to find currently trending terms. Click a term to 
          start exploring the tweets, users, and associated media.
        </Intro>
      )
      newLocation = (
        <AddPlace
          limit={6}
          places={this.props.trends}
          world={this.props.world}
          newPlace={this.props.newPlace}
          updateNewTrend={this.props.updateNewTrend}
          placeLabelToId={this.props.placeLabelToId}
          deleteTrend={this.props.deleteTrend}
          saveTrends={this.props.saveTrends} />
      )
    }

    return (
      <div>
        <div className={this.state.mediaStyle}>
          {introElement}
          <div className={card.CardHolder}>
            {this.props.trends.map(place => (
              <Place
                key={place.name}
                trends={place.trends}
                id={place.id}
                name={place.name}
                world={this.props.world}
                deleteTrend={this.props.deleteTrend}
                username={this.props.username}
                createSearch={this.props.createSearch}/>
            ))}
            {newLocation}
          </div>
        </div>
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
  createSearch: PropTypes.func
}
