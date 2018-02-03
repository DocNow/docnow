import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from './TweetTabBar.css'

export default class TweetTabBar extends Component {

  render() {
    return (
      <div className={style.TweetTabBar}>
        <ul>

          <li>
            <a className={style.TweetTab + ' ' + style.TweetTabActive} href="/">
              <i className="fa fa-archive" aria-hidden="true" />
              All
            </a>
          </li>

          <li>
            <a className={style.TweetTab} href="exampleselected.html">
              <i className="fa fa-check-square-o" aria-hidden="true" />
              Selected
            </a>
          </li>

          <li>
            <a  className={style.TweetTab} href="exampleannotated.html">
              <i className="fa fa-comment" aria-hidden="true" />
              Annotated
            </a>
          </li>

        </ul>
      </div>
    )
  }
}

TweetTabBar.propTypes = {
  active: PropTypes.string
}
