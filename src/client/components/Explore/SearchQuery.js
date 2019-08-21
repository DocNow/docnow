import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchTerm from './SearchTerm'

import style from './SearchTerm.css'
import styleQuery from './SearchQuery.css'
import "@material/elevation/mdc-elevation.scss"
import {ChipSet, Chip} from '@material/react-chips';

export default class SearchQuery extends Component {
  constructor(props) {
    super(props)
    this.box = React.createRef()
  }

  onClick(e) {
    // Make sure the user has clicked on the box and not on a SearchTerm
    if (e.target.tagName !== 'INPUT' && !e.target.classList.contains('mdc-chip')) {
      this.props.addSearchTerm({value: '', type: 'input'})
    }
  }

  render() {
    let placeHolder = ''
    if (this.props.query.length === 0 && ! this.props.active) {
      placeHolder = (
        <div>
          enter a <Chip className={style.SearchTerm + ' ' + style.Keyword} label="keyword"/>
          <Chip className={style.SearchTerm + ' ' + style.Phrase} label="a phrase"/>
          <Chip className={style.SearchTerm + ' ' + style.Hashtag} label="#hashtag"/>
          <Chip className={style.SearchTerm + ' ' + style.User} label="@user"/>
        </div>
      )
    }
    return (
      <div id="box" onClick={(e) => {this.onClick(e)}} className={`mdc-elevation--z4 ${styleQuery.SearchQuery}`}>
        {placeHolder}
        <ChipSet input>
          {this.props.query.map((term, i) => (
            <SearchTerm
              id={`t${i}`}
              key={`t${i}`}
              pos={i}
              focused={term.focused}
              type={term.type}
              onInput={this.props.updateSearchTerm}
              value={term.value}
              createSearch={this.props.createSearch}
              query={this.props.query}
              focusSearchTerm={this.props.focusSearchTerm} />
          ))}
        </ChipSet>
      </div>
    )
  }

}

SearchQuery.propTypes = {
  query: PropTypes.array,
  updateSearchTerm: PropTypes.func,
  addSearchTerm: PropTypes.func,
  focusSearchTerm: PropTypes.func,
  active: PropTypes.bool,
  createSearch: PropTypes.func,
}
