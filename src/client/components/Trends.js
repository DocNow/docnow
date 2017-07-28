import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Place from './Place'
import AddPlace from './AddPlace'
import '../images/dn.png'
import styles from './Trends.css'

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
    let addPlace = null
    if (loggedIn) {
      addPlace = (
        <AddPlace
          limit={5}
          places={this.props.trends}
          world={this.props.world}
          updateNewTrend={this.props.updateNewTrend}
          newPlace={this.props.newPlace}
          placeLabelToId={this.props.placeLabelToId}
          deleteTrend={this.props.deleteTrend}
          saveTrends={this.props.saveTrends} />
      )
    }

    let message = null
    if (this.props.trends.length === 0 && loggedIn) {
      message = (
        <div className={styles.Welcome}>
          It looks like you might be new here.
          Get started by adding a few locations to monitor.
        </div>
      )
    }

    return (
      <div>
        <div className={styles.Trends}>
          {message}
          {this.props.trends.map(place => (
            <Place
              key={place.name}
              trends={place.trends}
              placeId={place.placeId}
              name={place.name}
              deleteTrend={this.props.deleteTrend}
              username={this.props.username} />
          ))}
        </div>
        <div className={styles.AddPlace}>
          {addPlace}
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
  saveTrends: PropTypes.func
}
