import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'
import '@material/react-text-field/index.scss'

import '@material/react-fab/index.scss';
import Fab from '@material/react-fab'

import style from './AddPlace.css'

export default class AddPlace extends Component {

  constructor(props) {
    super(props)
    this.checkPlace = this.checkPlace.bind(this)
    this.addPlaceInputRef = React.createRef()
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

  checkPlace() {
    const placeId = this.props.placeLabelToId(this.props.newPlace)
    if (placeId) {
      this.props.saveTrends(placeId)
    }
  }

  render() {

    const inputProps = {
      placeholder: 'ADD PLACE'
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
          menuStyle={{
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 12px',
            background: 'rgba(255, 255, 255, 0.9) none repeat scroll 0% 0%',
            padding: '2px',
            fontSize: '90%',
            position: 'fixed',
            overflow: 'auto',
            maxHeight: '140px'
          }}
          renderItem={(item, isHighlighted) => (
            <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              {item}
            </div>
           )}
           value={this.props.newPlace}
           onChange={(event, value) => this.props.updateNewTrend(value)}
           onSelect={value => this.props.updateNewTrend(value)}
           inputProps={inputProps} />
        <Fab
          mini tabIndex="0"
          icon={<span><ion-icon name="add"></ion-icon></span>} 
          onClick={ this.checkPlace }
          disabled={placeDisabled} />
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
