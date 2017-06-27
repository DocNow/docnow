import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Profile.css'

export default class Profile extends Component {

  componentDidMount() {
    this.props.getPlaces()
  }

  render() {
    return (
      <div className={ style.Profile }>
        Name: { this.props.user.name }
        <br />
        Twitter Username: <a href={ 'https://twitter.com/' + this.props.user.twitterScreenName }>
          { this.props.user.twitterScreenName }
        </a>
        <br />
        <br />
        Monitoring Places:
        <ul>
        { this.props.places.map( (loc, i) => {
          return <li key={i} className={ style.Place }>{ loc }</li>
        })}
        </ul>
        Add a Place to Monitor:
        <input onChange={ this.props.updateNewPlace }
               type="text" name="place" value={ this.props.newPlace } />
        <br />
        <button onClick={ this.props.savePlaces } className="save">Save</button>
      </div>
    )
  }
}

Profile.propTypes = {
  user: PropTypes.object,
  places: PropTypes.array,
  getPlaces: PropTypes.func,
  updateNewPlace: PropTypes.func,
  savePlaces: PropTypes.func,
  newPlace: PropTypes.string
}
