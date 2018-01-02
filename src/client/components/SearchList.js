import moment from 'moment'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/SearchList.css'
import { Link } from 'react-router-dom'


export default class SavedSearch extends Component {

  componentDidMount() {
    this.props.getSearches()
  }

  render() {

    return (
      <div className={style.Grid}>
        <div className={style.GridRow}>
          <div className={style.GridItem}><h2>Title</h2></div>
          <div className={style.GridItem}><h2>Tweet Count</h2></div>
          <div className={style.GridItem}><h2>Activity</h2></div>
          <div className={style.GridItem}><h2>Actions</h2></div>
        </div>
        {this.props.searches.map((search, i) => {
          const rowClass = i % 2 === 0 ? style.GridRowGray : style.GridRow
          const created = moment(search.created).local().format('MMM D h:mm A')
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
                { parseInt(search.count, 10).toLocaleString() }
              </div>
              <div className={style.GridActivity}>
                Created {created}
              </div>

              <div className={style.GridActions}>
                <div className={style.GridRowGrayInner}>
                  <div className={style.GridActionsInner}>
                    <label className={style.Switch}>
                      <input type="checkbox" />
                      <span className={style.Slider + ' ' + style.Round} />
                    </label>
                  </div>
                  <div className={style.GridActionsInner} title="delete">
                    <a href="">
                      <i className={style.Trash + ' fa fa-trash'} aria-hidden="true" />
                    </a>
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

SavedSearch.propTypes = {
  searches: PropTypes.array,
  getSearches: PropTypes.func,
}
