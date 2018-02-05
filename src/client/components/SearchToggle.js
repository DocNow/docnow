import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from './SearchToggle.css'

export default class SearchToggle extends Component {

  toggle(e) {
    console.log('toggle', e.target.checked)
    this.props.updateSearch({
      id: this.props.id,
      active: e.target.checked
    })
  }

  render() {
    return (
      <label className={style.Switch}>
        <input
          type="checkbox"
          checked={this.props.active}
          onChange={(e) => {this.toggle(e)}} />
        <span className={style.Slider + ' ' + style.Round} />
      </label>
    )
  }

}

SearchToggle.propTypes = {
  id: PropTypes.string,
  updateSearch: PropTypes.func,
  active: PropTypes.bool
}
