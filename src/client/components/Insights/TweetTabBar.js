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
              <ion-icon name="filing"></ion-icon>
              All
            </a>
          </li>

          <li>
            <a className={style.TweetTab} href="#">
              <ion-icon name="checkbox-outline"></ion-icon>
              Selected
            </a>
          </li>

          <li>
            <a  className={style.TweetTab} href="#">
              <ion-icon name="chatbubbles"></ion-icon>
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
