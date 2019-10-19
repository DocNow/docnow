import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './SearchTerm.css'
import '@material/react-chips/index.scss'

export default class SearchTerm extends Component {

  constructor(props) {
    super(props)
    this.chip = React.createRef()
  }

  componentDidMount() {
    this.chip.current.focus()
  }

  componentDidUpdate() {
    if (this.props.focused) {
      this.chip.current.focus()
    }
  }

  keyDown(e) {
    const key = e.which || e.keyCode
    switch (key) {
      case 13:
        // Enter
        if (this.props.pos === 0 && this.props.value === '') {break}
        this.props.createSearch(this.props.query)
        break
      case 37:
        // Left Arrow
        if (e.target.selectionStart === 0) {
          // focus preceding
          this.props.focusSearchTerm(this.props.pos - 1, false)
        }
        break
      case 39:
        // Right Arrow
        if (e.target.selectionStart === e.target.value.length) {
          // focus next
          this.props.focusSearchTerm(this.props.pos + 1, true)
        }
        break
      default:
        // no-op
    }
    e.stopPropagation()
  }

  update(e) {
    this.props.onInput({
      type: this.props.type,
      value: e.target.value,
      pos: this.props.pos
    })
  }

  click(e) {
    if (this.props.onClick) {
      this.props.onClick(e.target)
    }
  }

  guessType() {
    if (this.props.value.match(/ /g)) {
      return 'phrase'
    } else if (this.props.value.startsWith('#')) {
      return 'hashtag'
    } else if (this.props.value.startsWith('@')) {
      return 'user'
    } else {
      return 'keyword'
    }
  }

  cssClass(type) {
    switch (type) {
      case 'keyword':
        return style.Keyword
      case 'hashtag':
        return style.Hashtag
      case 'phrase':
        return style.Phrase
      case 'user':
        return style.User
      default:
        return ''
    }
  }

  render() {
    const type = this.guessType()
    const cssClass = this.cssClass(type)
    const otherClassNames = this.props.className ? this.props.className : ''
    let chip = (
      <span className={`mdc-chip__text ${style.SearchTerm} ${otherClassNames}`}
          ref={this.chip}          
          onClick={(e) => this.click(e)}          
          data-type={type}>
          {this.props.value}</span>
    )
    if (this.props.onInput) {
      chip = (
        <input className={`mdc-chip__text ${style.SearchTerm} ${otherClassNames}`}
          spellCheck={false}
          ref={this.chip}
          data-type={type}
          onKeyDown={(e) => {this.keyDown(e)}}
          onChange={(e) => {this.update(e)}}
          onBlur={(e) => {this.update(e)}}
          value={this.props.value}
          style={{width: `${this.props.value.length || 1}ch`}}/>
      )
    }
    return (
      <span className={`mdc-chip ${cssClass}`}>
        {chip}
      </span>
    )
  }
}

SearchTerm.propTypes = {
  className: PropTypes.string,
  pos: PropTypes.number,
  focused: PropTypes.object,
  type: PropTypes.string,
  value: PropTypes.string,
  onInput: PropTypes.func,
  onClick: PropTypes.func,
  createSearch: PropTypes.func,
  query: PropTypes.array,
  focusSearchTerm: PropTypes.func,
}
