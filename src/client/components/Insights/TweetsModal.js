import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {TwitterTweetEmbed} from 'react-twitter-embed'
import Modal from 'react-modal'

import CloseModal from './CloseModal'
import style from './TweetsModal.css'

export default class TweetsModal extends Component {

  render() {
    const modalStyle = {
      content: {
        padding: '0px',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '400px'
      }
    }
    const app = document.getElementById('App')
    return (
      <Modal isOpen={this.props.isOpen} style={modalStyle} appElement={app}>
        <CloseModal close={this.props.close} title="Tweets" />
        <div className={style.Conversation}>
        { this.props.tweets.map((tweet) => {

          let className = style.Tweet
          let userInfo = null
          if (tweet.retweet) {
            className = style.Retweet
            userInfo = (
              <div className={style.UserProfile}>
                <ion-icon name="repeat"></ion-icon>
                <img src={tweet.user.avatarUrl} />
                <div>
                  <a target="_new" href={`https://twitter.com/${tweet.user.screenName}`}>
                    {tweet.user.name}
                  </a>
                  <br />
                  <span className={style.ScreenName}>
                    @{tweet.user.screenName}
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div key={tweet.id} className={className}>
              {userInfo}
              <TwitterTweetEmbed
                tweetId={tweet.id}
                options={{cards: 'hidden'}} />
            </div>
          )
        })}
        </div>
      </Modal>
    )
  }
}

TweetsModal.propTypes = {
  tweets: PropTypes.array,
  isOpen: PropTypes.bool,
  close: PropTypes.func,
}
