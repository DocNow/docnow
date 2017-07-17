import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Profile.css'
import Autocomplete from 'react-autocomplete'
import Keys from './Keys'

export default class Profile extends Component {

  componentDidMount() {
    this.props.getPlaces()
    this.props.getSettings()
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
    let superUser = ''
    let adminSettings = ''
    if (this.props.user.isSuperUser === 'true') {
      superUser = '(Admin)'
      adminSettings = (
        <Keys
          appKey={this.props.appKey}
          appSecret={this.props.appSecret}
          updateSettings={this.props.updateSettings}
        />
      )
    }

    return (
      <div className={ style.Profile }>
        Name: { this.props.user.name }&nbsp;{ superUser }
        <br />
        Twitter Username: <a href={ 'https://twitter.com/' + this.props.user.twitterScreenName }>
          { this.props.user.twitterScreenName }
        </a>
        <br />
        <br />
        Monitoring Places:
        <ul>
        { this.props.places.map( (loc, i) => {
          const place = this.props.placeIdToLabel(loc)
          return (
            <li key={i} className={ style.Place }>
             <button className="del" onClick={()=>{this.props.deletePlace(loc)}}>x</button>{ place }
            </li>)
        })}
        </ul>
        Add a Place to Monitor:
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
        />
        <br />

        {adminSettings}

        <button onClick={ this.checkPlace } className="save">Save</button>
      </div>
    )
  }
}

Profile.propTypes = {
  user: PropTypes.object,
  places: PropTypes.array,
  placesByName: PropTypes.object,
  getPlaces: PropTypes.func,
  getWorld: PropTypes.func,
  placeLabelToId: PropTypes.func,
  placeIdToLabel: PropTypes.func,
  updateNewPlace: PropTypes.func,
  deletePlace: PropTypes.func,
  savePlaces: PropTypes.func,
  newPlace: PropTypes.string,
  appKey: PropTypes.string,
  appSecret: PropTypes.string,
  getSettings: PropTypes.func,
  updateSettings: PropTypes.func
}
