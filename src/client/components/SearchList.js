import moment from 'moment'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Trash from './Trash'
import SearchToggle from './SearchToggle'
import style from './SearchList.css'

export default class SearchList extends Component {

  componentDidMount() {
    // if we don't have any list of searches or they are looking for a specific 
    // users searches then fire off a request to get them immediately.
    if (this.props.searches.length === 0 || this.props.forUserId) {
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
    console.log('tick')
    const userId = this.props.forUserId || this.props.user.id
    this.props.getSearches(userId)
  }

  render() {

    return (
      <div className={style.Grid}>
        <div className={style.GridRow}>
          <div className={style.GridItem}><h2>Title</h2></div>
          <div className={style.GridItem}><h2>Tweet Count</h2></div>
          <div className={style.GridItem}><h2>Created</h2></div>
          <div className={style.GridItem}><h2>Last Update</h2></div>
          <div className={style.GridItem}><h2>Actions</h2></div>
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
                <ion-icon name="logo-twitter"></ion-icon>
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
              <div className={style.GridRowInner}>
                  <div className={style.GridActionsInner}>
                    <SearchToggle
                      id={search.id}
                      active={search.active}
                      user={this.props.user}
                      updateSearch={this.props.updateSearch} />
                  </div>
              <div className={style.GridActionsInner}>
                    <Trash
                      id={search.id}
                      deleteSearch={this.props.deleteSearch} />
              </div>
             </div>
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
  user: PropTypes.object,
  forUserId: PropTypes.string,
}
