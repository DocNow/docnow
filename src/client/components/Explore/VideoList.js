import React, { Component } from 'react'
import PropTypes from 'prop-types'
import exploreStyles from './Explore.css'
import style from './VideoList.css'
import animations from '../animations.css'

export default class VideoList extends Component {

  render() {
    let loader = null
    if (this.props.videos.length === 0) {
      loader = (<span className={`${animations.Spin} ${exploreStyles.Loader}`}>
        <ion-icon name="logo-ionic"></ion-icon>
      </span>)
    }
    return (
      <div className={exploreStyles.InnerCard}>
        {loader}
        {this.props.videos.map((video) => (
          <div key={video.url} className={style.Video}>
            <video controls preload="none" poster={video.thumbnailUrl}>
              <source src={video.url} />
            </video>
            <figcaption>
              <ion-icon name="repeat"></ion-icon> {video.count}
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
