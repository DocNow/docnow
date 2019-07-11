import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'
import '@material/react-text-field/index.scss'
// import TextField, {Input} from '@material/react-text-field'
// import MaterialIcon from '@material/react-material-icon'

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

    const inputProps = {
      placeholder: 'ADD PLACE'
    }
    // let placeDisabled = false

    if (this.props.places.length >= this.props.limit) {
      inputProps.disabled = true
      // placeDisabled = true
    }
    return (
      <div className={styles.AddPlace}>
        <Autocomplete
          getItemValue={(item) => item}
          sortItems={this.sortPlaces}
          items={Object.keys(this.props.world)}
          shouldItemRender={this.matchInputToTerm}
          renderMenu={items => {
            return <ul className={`mdc-list`}>{items}</ul>
          }}
          renderItem={(item, isHighlighted) => (
            <li key={item} className="mdc-list-item" style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              <span className="mdc-list-item__text">{item}</span>
            </li>
          )}
          value={this.props.newPlace}
          onChange={(event, value) => this.props.updateNewTrend(value)}
          onSelect={value => this.props.updateNewTrend(value)}
          
          inputProps={inputProps} >
        </Autocomplete>
        <button onClick={ this.checkPlace }>+</button>
      </div>
    )
  }
}

/*
renderInput={(props) => {
            return (
              <div className={styles.AddPlace}>
                <TextField label={props.placeholder}>
                  <Input {...props} />
                </TextField>
              </div>
            )
          }}
*/

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
