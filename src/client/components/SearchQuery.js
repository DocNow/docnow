import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchTerm from './SearchTerm'
import styles from '../styles/Search.css'

export default class SearchQuery extends Component {

  onClick() {
    this.props.addSearchTerm({value: ''})
  }

  render() {
    return (
      <div onClick={(e) => {this.onClick(e)}} className={styles.SearchQuery}>
        {this.props.query.map((term, i) => (
          <SearchTerm
            key={`t${i}`}
            pos={i}
            type={term.type}
            onInput={this.props.updateSearchTerm}
            value={term.value} />
        ))}
      </div>
    )
  }

}

SearchQuery.propTypes = {
  query: PropTypes.array,
  updateSearchTerm: PropTypes.func,
  addSearchTerm: PropTypes.func,
}
