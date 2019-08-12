import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'
import '@material/react-text-field/index.scss'

import styles from './AddPlace.css'

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

    const inputProps = { }
    inputProps.disabled = false
    let addBtnActive = true

    if (this.props.places.length >= this.props.limit) {
      inputProps.disabled = true
      addBtnActive = styles.NoClick
    }
    return (
      <div className={styles.AddPlace}>
        <Autocomplete
          getItemValue={(item) => item}
          sortItems={this.sortPlaces}
          items={Object.keys(this.props.world)}
          shouldItemRender={this.matchInputToTerm}
          menuStyle={{
            borderRadius: '3px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 0',
            fontSize: '90%',
            overflowY: 'scroll',
            maxHeight: '250px'
          }}
          renderItem={(item, isHighlighted) => (
            <div key={item} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              {item}
            </div>
          )}
          value={this.props.newPlace}
          onChange={(event, value) => this.props.updateNewTrend(value)}
          onSelect={value => this.props.updateNewTrend(value)}
          inputProps={inputProps}
          renderInput={props => {
            return (<div className="mdc-text-field mdc-text-field--with-trailing-icon">
              <input {...props} className="mdc-text-field__input" tabIndex="0" placeholder="Add Place"/>
              <i className={`material-icons mdc-text-field__icon ${addBtnActive}`} tabIndex="1" onClick={ this.checkPlace }>add</i>
              <div className="mdc-line-ripple"/>
            </div>)
          }} />
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
