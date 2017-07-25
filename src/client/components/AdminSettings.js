import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Profile.css'
import LogoUpload from './LogoUpload'
import Keys from './Keys'
import AddPlace from './AddPlace'

export default class AdminSettings extends Component {

  componentDidMount() {
    this.props.getPlaces()
  }

  render() {
    return (
      <div>
        <h3>Admin Settings</h3>
        <label htmlFor="instanceTitle">Instance Title</label><br />
        <br />
        <input size="30" onChange={this.props.updateSettings}
               id="instanceTitle" name="instanceTitle" type="text" value={this.props.instanceTitle} />
        <br />
        <LogoUpload
          logoUrl={this.props.logoUrl}
          updateSettings={this.props.updateSettings}/>
        <Keys
          appKey={this.props.appKey}
          appSecret={this.props.appSecret}
          updateSettings={this.props.updateSettings}
        />
        <h4>Home Page Trending Locations</h4>
        <ul>
        { this.props.places.map( (loc, i) => {
          const place = this.props.placeIdToLabel(loc)
          return (
            <li key={i} className={ style.Place }>
             <button onClick={()=>{this.props.deletePlace(loc)}}>x</button>{ place }
            </li>)
        })}
        </ul>
        <AddPlace
          limit={3}
          places={this.props.places}
          placesByName={this.props.placesByName}
          updateNewPlace={this.props.updateNewPlace}
          newPlace={this.props.newPlace}
          placeLabelToId={this.props.placeLabelToId}
          savePlaces={this.props.savePlaces} />
      </div>
    )
  }
}

AdminSettings.propTypes = {
  user: PropTypes.object,
  places: PropTypes.array,
  placesByName: PropTypes.object,
  getPlaces: PropTypes.func,
  placeLabelToId: PropTypes.func,
  placeIdToLabel: PropTypes.func,
  updateNewPlace: PropTypes.func,
  deletePlace: PropTypes.func,
  savePlaces: PropTypes.func,
  newPlace: PropTypes.string,
  appKey: PropTypes.string,
  appSecret: PropTypes.string,
  logoUrl: PropTypes.string,
  instanceTitle: PropTypes.string,
  saveSettings: PropTypes.func,
  updateSettings: PropTypes.func
}
