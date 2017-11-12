import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Search.css'

export default class SearchTerm extends Component {

  guessType() {
    if (this.props.value.startsWith('#')) {
      return 'hashtag'
    } else if (this.props.value.match(/ /)) {
      return 'phrase'
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
      default:
        return style.Keyword
    }
  }

  render() {
    const type = this.props.type || this.guessType()
    const cssClass = this.cssClass(type)
    return (
      <span
        onClick={this.props.action}
        data-type={type}
        className={style.SearchTerm + ' ' + cssClass}
        title={`${type} ${this.props.value}`}>
        { this.props.value }
      </span>
    )
  }
}

SearchTerm.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  action: PropTypes.func
}
