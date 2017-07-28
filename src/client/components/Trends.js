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
    let addPlace = null
    if (this.props.username) {
      addPlace = (
        <AddPlace
          limit={5}
          places={this.props.trends}
          placesByName={this.props.placesByName}
          updateNewPlace={this.props.updateNewPlace}
          newPlace={this.props.newPlace}
          placeLabelToId={this.props.placeLabelToId}
          savePlaces={this.props.savePlaces} />
      )
    }

    return (
      <div>
        <div className={styles.Trends}>
          {this.props.trends.map(place =>
            <Place key={place.name} trends={place.trends} name={place.name} />
          )}
        </div>
        {addPlace}
      </div>
    )
  }

}

Trends.propTypes = {
  username: PropTypes.string,
  trends: PropTypes.array,
  getTrends: PropTypes.func,
  placesByName: PropTypes.object,
  updateNewPlace: PropTypes.func,
  newPlace: PropTypes.string,
  placeLabelToId: PropTypes.func,
  savePlaces: PropTypes.func,
  deletePlace: PropTypes.func
}
