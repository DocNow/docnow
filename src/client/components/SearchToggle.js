import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Message from './message'
import style from './SearchToggle.css'

export default class SearchToggle extends Component {

  constructor(props) {
    super(props)
    this.resetError = this.resetError.bind(this)
    this.state = {
      error: null
    }
  }

  toggle(e) {
    if (this.props.user.active === false) {
      this.setState({error: 'You are over quota. Please delete some tweets.'})
    } else {
      this.props.updateSearch({
        id: this.props.id,
        active: e.target.checked,
        archived: false
      })
    }
  }

  resetError() {
    this.setState({error: null})
  }

  render() {
    const title = this.props.active ? 'Stop Data Collection' : 'Start Data Collection'
    const msg = this.state.error ? <Message type="error" text={this.state.error} onClose={this.resetError} /> : ''

    return (
      <>
        <div className={style.SearchToggle}>
          <label title={title} className={style.Switch}>
            <input
              type="checkbox"
              checked={this.props.active}
              onChange={(e) => {this.toggle(e)}} />
            <span className={style.Slider + ' ' + style.Round} />
          </label>
        </div>
        {msg}
      </>
    )
  }

}

SearchToggle.propTypes = {
  id: PropTypes.string,
  updateSearch: PropTypes.func,
  active: PropTypes.bool,
  user: PropTypes.object
}
