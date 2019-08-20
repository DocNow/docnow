import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Editable extends Component {

  constructor(props) {
    super(props)
    this.editing = false
  }

  onClick() {
    this.editing = true
    this.forceUpdate()
  }

  onChange(e) {
    this.props.update(e.target.value)
  }

  keyDown(e) {
    if (e.key === 'Enter') {
      this.editing = false
      e.stopPropagation()
      this.forceUpdate()
    }
  }

  render() {
    if (this.editing) {
      const text = this.props.text || ''
      const size = text.length || 10
      return (
        <input
          autoFocus="autofocus"
          size={size}
          type="text"
          value={text}
          onChange={(e) => {this.onChange(e)}}
          onKeyDown={(e) => {this.keyDown(e)}} />
      )
    } else {
      const text = this.props.text || this.props.placeholder
      return (
        <span>
          {text}
          &nbsp;
          <ion-icon name="create" onClick={(e) => {this.onClick(e)}}></ion-icon>
        </span>
      )
    }
  }

}

Editable.propTypes = {
  text: PropTypes.string,
  update: PropTypes.func,
  placeholder: PropTypes.string
}
