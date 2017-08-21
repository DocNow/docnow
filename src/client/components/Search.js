import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Search.css'
import TweetListBox from '../containers/TweetListBox'
import UserListBox from '../containers/UserListBox'
import HashtagsBox from '../containers/HashtagsBox'
import MediaBox from '../containers/MediaBox'

export default class Search extends Component {

  componentDidMount() {
    this.props.searchTwitter(this.props.q)
  }

  render() {
    return (<div className={ style.Column }>
      <div className={ style.Row }>
        <div>
          <h4>Sample Tweets</h4>
          <TweetListBox endpoint={this.props.searchInfo.tweets}/>
        </div>
        <div>
          <h4>Top Users</h4>
          <UserListBox endpoint={this.props.searchInfo.users}/>
        </div>
        <div>
          <h4>Top Hashtags</h4>
          <HashtagsBox endpoint={this.props.searchInfo.hashtags}/>
        </div>
      </div>
      <div className={ style.Row }>
      <div>
        <h4>Media</h4>
        <MediaBox endpoint={this.props.searchInfo.tweets}/>
      </div>
      </div>
    </div>)
  }

}

Search.propTypes = {
  searchInfo: PropTypes.object,
  q: PropTypes.string,
  searchTwitter: PropTypes.func
}
