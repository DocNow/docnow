import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Place from './Place'
import '../images/dn.png'
import styles from './Trends.css'
import AddPlace from './AddPlace'

export default class Trends extends Component {

  componentDidMount() {
    this.props.getPlaces()
    this.props.getUserPlaces()
    const intervalId = setInterval(this.props.getPlaces, 3000)
    this.setState({intervalId: intervalId})
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
    this.setState({intervalId: null})
  }

  render() {
    let addUserTrends = null
    if (this.props.userLoggedIn) {
      addUserTrends = (<AddPlace
        limit={5}
        places={this.props.places}
        placesByName={this.props.placesByName}
        updateNewPlace={this.props.updateNewPlace}
        newPlace={this.props.newPlace}
        placeLabelToId={this.props.placeLabelToId}
        savePlaces={this.props.savePlaces} />)
    }

    return (
      <div>
        {addUserTrends}
        <div className={styles.Trends}>
          {this.props.places.map(place =>
            (<Place
              key={place.name}
              trends={place.trends}
              placeId={place.placeId}
              name={place.name}
              isUserPlace={place.user}
              deletePlace={this.props.deletePlace} />)
          )}
        </div>
      </div>
    )
  }

}

Trends.propTypes = {
  places: PropTypes.array,
  getPlaces: PropTypes.func,
  getUserPlaces: PropTypes.func,
  userLoggedIn: PropTypes.bool,
  placesByName: PropTypes.object,
  updateNewPlace: PropTypes.func,
  newPlace: PropTypes.string,
  placeLabelToId: PropTypes.func,
  savePlaces: PropTypes.func,
  deletePlace: PropTypes.func
}
