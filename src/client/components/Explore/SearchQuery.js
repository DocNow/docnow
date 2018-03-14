import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchTerm from './SearchTerm'

import style from './SearchTerm.css'
import styleQuery from './SearchQuery.css'

export default class SearchQuery extends Component {

  onClick() {
    this.props.addSearchTerm({value: ' ', type: 'input'})
  }

  render() {
    let placeHolder = <span>&nbsp;</span>
    if (this.props.query.length === 0 && ! this.props.active) {
      placeHolder = (
        <div>
          enter a <span className={style.SearchTerm + ' ' + style.Keyword}>keyword</span>
          <span className={style.SearchTerm + ' ' + style.Phrase}>a phrase</span>
          <span className={style.SearchTerm + ' ' + style.Hashtag}>#hashtag</span>
          <span className={style.SearchTerm + ' ' + style.User}>@user</span>
        </div>
      )
    }
    return (
      <div onClick={(e) => {this.onClick(e)}} className={styleQuery.SearchQuery}>
        {placeHolder}
        {this.props.query.map((term, i) => (
          <SearchTerm
            key={`t${i}`}
            pos={i}
            type={term.type}
            onInput={this.props.updateSearchTerm}
            value={term.value}
            createSearch={this.props.createSearch}
            query={this.props.query} />
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
  createSearch: PropTypes.func,
}
