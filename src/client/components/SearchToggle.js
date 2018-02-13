import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from './SearchToggle.css'

export default class SearchToggle extends Component {

  toggle(e) {
    this.props.updateSearch({
      id: this.props.id,
      active: e.target.checked
    })
  }

  render() {
    const title = this.props.active ? 'Stop Data Collection' : 'Start Data Collection'
    return (
      <div className={style.SearchToggle}>
        <label title={title} className={style.Switch}>
          <input
            type="checkbox"
            checked={this.props.active}
            onChange={(e) => {this.toggle(e)}} />
          <span className={style.Slider + ' ' + style.Round} />
        </label>
      </div>
    )
  }

}

SearchToggle.propTypes = {
  id: PropTypes.string,
  updateSearch: PropTypes.func,
  active: PropTypes.bool
}
