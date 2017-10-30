import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import Hashtag from './Hashtag'
import styles from '../styles/Hashtags.css'
import { scaleLinear, max } from 'd3'

export default class Hashtags extends Component {

  render() {

    const maxX = max(this.props.hashtags.map((ht) => {return ht.count}))
    const scaleX = scaleLinear()
          .domain([0, maxX])
          .range([0, 300])

    let loader = null
    if (this.props.hashtags.length === 0) {
      loader = 'Loading...'
    }

    return (
        <div className={styles.HashtagsCard}>
          {loader}
          <svg height={800}>
          {this.props.hashtags.map((ht, i) => (
            <rect
              className={styles.HashtagBar}
              x={0}
              y={i * 25}
              key={'hashtag-' + i}
              height={20}
              width={scaleX(ht.count)} />
          ))}
          </svg>
        </div>
    )
  }
}

Hashtags.propTypes = {
  hashtags: PropTypes.array
}
