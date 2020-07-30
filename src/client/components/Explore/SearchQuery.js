import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchTerm from './SearchTerm'

import style from './SearchTerm.css'
import styleQuery from './SearchQuery.css'
import Paper from '@material-ui/core/Paper'

export default class SearchQuery extends Component {
  constructor(props) {
    super(props)
    this.box = React.createRef()
  }

  onClick(e) {
    // Make sure the user has clicked on the box and not on a SearchTerm
    if (e.target.tagName !== 'INPUT') {
      this.props.addSearchTerm({value: '', type: 'input'})
    }
  }

  render() {
    let placeHolder = ''
    if (this.props.query.length === 0 && ! this.props.active) {
      placeHolder = (
        <div>
          enter a <span className={style.SearchTerm + ' ' + style.Keyword}>&nbsp;keyword&nbsp;</span> &nbsp;
          <span className={style.SearchTerm + ' ' + style.Phrase}>&nbsp;a phrase&nbsp;</span> &nbsp;
          <span className={style.SearchTerm + ' ' + style.Hashtag}>&nbsp;#hashtag&nbsp;</span> &nbsp;
          <span className={style.SearchTerm + ' ' + style.User}>&nbsp;@user&nbsp;</span>
        </div>
      )
    }
    return (
      <Paper id="box" elevation={4} onClick={(e) => {this.onClick(e)}} className={styleQuery.SearchQuery}>
        {placeHolder}
        <form noValidate autoComplete="off" style={{
          display: 'flex',
          justifyContent: 'left'
        }}>
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
        </form>
      </Paper>
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
