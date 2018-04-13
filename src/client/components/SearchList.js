import moment from 'moment'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Trash from './Trash'
import SearchToggle from './SearchToggle'
import style from './SearchList.css'

export default class SearchList extends Component {

  componentWillMount() {
    if (this.props.searches.length === 0) {
      this.tick()
    }
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    this.props.getSearches()
  }

  render() {

    return (
      <div className={style.Grid}>
        <div className={style.GridRow}>
          <div className={style.GridItem}><h2>Title</h2></div>
          <div className={style.GridItem}><h2>Tweet Count</h2></div>
          <div className={style.GridItem}><h2>Created</h2></div>
          <div className={style.GridItem}><h2>Last Update</h2></div>
          <div className={style.GridItem}><h2>Stream</h2></div>
          <div className={style.GridItem}><h2>Search</h2></div>
          <div className={style.GridItem}><h2>Delete</h2></div>
        </div>
        {this.props.searches.map((search, i) => {
          const rowClass = i % 2 === 0 ? style.GridRowGray : style.GridRow
          const created = moment(search.created).local().format('MMM D h:mm A')
          const updated = moment(search.updated).local().format('MMM D h:mm A')
          return (
            <div key={search.id} className={rowClass}>
              <div className={style.GridTitle}>
                <Link to={`/search/${search.id}/`}>
                  {search.title}
                </Link>
              </div>
              <div className={style.GridCount}>
                <i className="fa fa-twitter" />
                &nbsp;
                { search.tweetCount.toLocaleString() }
              </div>
              <div className={style.GridActivity}>
                {created}
              </div>
              <div className={style.GridActivity}>
                {updated}
              </div>
              <div className={style.GridActions}>
                    <SearchToggle
                      id={search.id}
                      active={search.active}
                      updateSearch={this.props.updateSearch} />
              </div>
              <div className={style.GridActions}>
                    <SearchToggle
                      id={search.id}
                      active={search.active}
                      updateSearch={this.props.updateSearch} />
              </div>
              <div className={style.GridActions}>
                    <Trash
                      id={search.id}
                      deleteSearch={this.props.deleteSearch} />
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

SearchList.propTypes = {
  searches: PropTypes.array,
  updateSearch: PropTypes.func,
  deleteSearch: PropTypes.func,
  getSearches: PropTypes.func,
}
