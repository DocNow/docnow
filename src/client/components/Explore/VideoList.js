import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './VideoList.css'

export default class VideoList extends Component {

  render() {
    let loader = null
    if (this.props.videos.length === 0) {
      loader = 'Loading...'
    }
    return (
      <div className={style.VideosCard}>
        {loader}
        {this.props.videos.map((video) => (
          <div key={video.url} className={style.Video}>
            <video controls src={video.url} />
            <figcaption>
              <i className="fa fa-retweet" aria-hidden="true" /> {video.count}
            </figcaption>
          </div>
        ))}
      </div>
    )
  }
}

VideoList.propTypes = {
  videos: PropTypes.array
}
