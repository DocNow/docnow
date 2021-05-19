import React from 'react'
import PropTypes from 'prop-types'
import {TwitterTweetEmbed} from 'react-twitter-embed'

const Tweet = (props) => {
    return (
      <TwitterTweetEmbed tweetId={props.data.id}/>
    )
}

Tweet.propTypes = {
  data: PropTypes.object
}

export default Tweet
