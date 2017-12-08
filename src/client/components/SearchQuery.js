import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchTerm from './SearchTerm'
import styles from '../styles/Search.css'

export default class SearchQuery extends Component {

  onClick() {
    this.props.addSearchTerm({value: '', type: 'input'})
  }

  render() {
    let placeHolder = <span>&nbsp;</span>
    if (this.props.query.length === 0 && ! this.props.active) {
      placeHolder = (
        <div>
          enter a <span className={styles.SearchTerm + ' ' + styles.Keyword}>keyword</span>
          <span className={styles.SearchTerm + ' ' + styles.Phrase}>a phrase</span>
          <span className={styles.SearchTerm + ' ' + styles.Hashtag}>#hashtag</span>
          <span className={styles.SearchTerm + ' ' + styles.User}>@user</span>
        </div>
      )
    }
    return (
      <div onClick={(e) => {this.onClick(e)}} className={styles.SearchQuery}>
        {placeHolder}
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
  active: PropTypes.bool,
}
