import React, { Component } from 'react'
import PropTypes from 'prop-types'
import exploreStyles from './Explore.css'
import styles from './ImageList.css'
import animations from '../animations.css'

export default class ImageList extends Component {

  render() {
    let loader = null
    if (this.props.images.length === 0) {
      loader = (<span className={`${animations.Spin} ${exploreStyles.Loader}`}>
        <ion-icon name="logo-ionic"></ion-icon>
      </span>)
    }
    return (
      <div className={exploreStyles.InnerCard}>
        {loader}
        {this.props.images.map((image) => (
          <figure key={image.url} className={styles.Image}>
            <img src={image.url} />
            <figcaption><ion-icon name="repeat"></ion-icon> {image.count} </figcaption>
          </figure>
        ))}
      </div>
    )
  }
}

ImageList.propTypes = {
  images: PropTypes.array
}
