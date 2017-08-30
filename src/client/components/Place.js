import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import AddPlace from './AddPlace'
import FlipMove from 'react-flip-move'
import { Link } from 'react-router-dom'
import styles from '../styles/Card.css'

export default class Place extends Component {
  render() {
    let trends = null
    // const remove = null
    if (this.props.username) {
      // remove = <button onClick={()=>{this.props.deleteTrend(this.props.placeId)}}>x</button>
      trends = this.props.trends.slice(0, 8).map(trend =>
        <li key={ trend.name + trend.text }><Link to={'/search/' + encodeURIComponent(trend.name)}>{ trend.name } { trend.tweets }</Link></li>
      )
    } else {
      trends = this.props.trends.slice(0, 8).map(trend =>
        <li key={ trend.name + trend.text }>{ trend.name } { trend.tweets }</li>
      )
    }

    const addPlace = <h2>{this.props.name}</h2>
    // if (this.props.username) {
    //   addPlace = (
    //     <AddPlace
    //       limit={5}
    //       places={this.props.trends}
    //       world={this.props.world}
    //       updateNewTrend={this.props.updateNewTrend}
    //       placeLabelToId={this.props.placeLabelToId}
    //       deleteTrend={this.props.deleteTrend}
    //       saveTrends={this.props.saveTrends} />
    //   )
    // }

    return (
      <card className={styles.Card}>
        <div className={styles.Data}>
          <FlipMove
            duration={2000}
            enterAnimation="elevator"
            leaveAnimation="fade">
            { trends }
          </FlipMove>
        </div>
        <div className={styles.Cardcontainer}>
        {addPlace}
        </div>
      </card>
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
  saveTrends: PropTypes.func,
  placeLabelToId: PropTypes.func,
  updateNewTrend: PropTypes.func
}
