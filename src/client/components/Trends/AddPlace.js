import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'

import style from './AddPlace.css'

export default class AddPlace extends Component {

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
      this.props.saveTrends(placeId)
    } else {
      // TODO: Replace with an alert component
      alert('place not found')
    }
  }

  render() {

    const inputProps = {
      placeholder: 'ENTER A PLACE NAME'
    }
    let placeDisabled = false

    if (this.props.places.length >= this.props.limit) {
      inputProps.disabled = true
      placeDisabled = true
    }
    return (
      <div className={style.AddPlace}>
        <Autocomplete
          getItemValue={(item) => item}
          sortItems={this.sortPlaces}
          items={Object.keys(this.props.world)}
          shouldItemRender={this.matchInputToTerm}
          renderItem={(item, isHighlighted) => (
            <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              {item}
            </div>
           )}
           value={this.props.newPlace}
           onChange={(event, value) => this.props.updateNewTrend(value)}
           onSelect={value => this.props.updateNewTrend(value)}
           inputProps={inputProps} />
        <button href="#" onClick={ this.checkPlace } className="Save" disabled={placeDisabled}><i className="fa fa-plus" aria-hidden="true"/></button>
      </div>
    )
  }
}

AddPlace.propTypes = {
  limit: PropTypes.number,
  places: PropTypes.array,
  world: PropTypes.object,
  updateNewTrend: PropTypes.func,
  newPlace: PropTypes.string,
  placeLabelToId: PropTypes.func,
  deleteTrend: PropTypes.func,
  saveTrends: PropTypes.func
}
