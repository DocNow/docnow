import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Profile.css'
import Autocomplete from 'react-autocomplete'
import Keys from './Keys'

export default class AdminSettings extends Component {

  componentDidMount() {
    this.props.getPlaces()
  }

  matchInputToTerm(input, value) {
    return (input.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
            input.toLowerCase().indexOf(value.toLowerCase()) !== -1)
  }

  sortPlaces(a, b, value) {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()
    const valueLower = value.toLowerCase()
    const queryPosA = aLower.indexOf(valueLower)
    const queryPosB = bLower.indexOf(valueLower)
    if (queryPosA !== queryPosB) {
      return queryPosA - queryPosB
    }
    return aLower < bLower ? -1 : 1
  }

  checkPlace = () => {
    const placeId = this.props.placeLabelToId(this.props.newPlace)
    if (placeId) {
      this.props.savePlaces(placeId)
    } else {
      // TODO: Replace with an alert component
      alert('place not found')
    }
  }

  render() {
    let inputProps = {}
    let placeDisabled = false

    if (this.props.places.length >= 3) {
      inputProps = {disabled: true}
      placeDisabled = true
    }

    return (
      <div>
        <h3>Admin Settings</h3>
        <label htmlFor="instanceTitle">Instance Title</label><br />
        <br />
        <input size="30" onChange={this.props.updateSettings}
               id="instanceTitle" name="instanceTitle" type="text" value={this.props.instanceTitle} />
        <br />
        <label htmlFor="logo">Logo</label><br />
        <br />
        <input size="30" id="logo" name="logo" type="file"/>
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
             <button className="del" onClick={()=>{this.props.deletePlace(loc)}}>x</button>{ place }
            </li>)
        })}
        </ul>
        <Autocomplete
           getItemValue={(item) => item}
           sortItems={this.sortPlaces}
           items={Object.keys(this.props.placesByName)}
           shouldItemRender={this.matchInputToTerm}
           renderItem={(item, isHighlighted) =>
             (<div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
               {item}
             </div>)
           }
           value={this.props.newPlace}
           onChange={(event, value) => this.props.updateNewPlace(value)}
           onSelect={value => this.props.updateNewPlace(value)}
           inputProps={inputProps}
         />
         <button onClick={ this.checkPlace } className="save" disabled={placeDisabled}>Add Place</button>
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
  instanceTitle: PropTypes.string,
  saveSettings: PropTypes.func,
  updateSettings: PropTypes.func
}
