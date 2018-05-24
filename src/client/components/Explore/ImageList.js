import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './ImageList.css'

export default class ImageList extends Component {

  render() {
    let loader = null
    if (this.props.images.length === 0) {
      loader = 'Loading...'
    }
    return (
      <div className={style.ImagesCard}>
        {loader}
        {this.props.images.map((image) => (
          <figure key={image.url} className={style.Image}>
            <img src={image.url} />
            <figcaption><i className="fa fa-retweet" aria-hidden="true" /> {image.count} </figcaption>
          </figure>
        ))}
      </div>
    )
  }
}

ImageList.propTypes = {
  images: PropTypes.array
}
