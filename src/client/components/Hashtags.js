import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Hashtag from './Hashtag'
import styles from '../styles/Hashtags.css'

export default class Hashtags extends Component {

  componentDidMount() {
    this.tick()
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    if (this.props.id) {
      this.props.getHashtags(this.props.id)
    }
  }

  render() {
    let loader = null
    if (this.props.hashtags.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={styles.HashtagsCard}>
          {loader}
          {this.props.hashtags.map(ht => (
            <Hashtag key={ht.hashtag} data={ht}/>
          ))}
        </div>
    )
  }
}

Hashtags.propTypes = {
  id: PropTypes.string,
  getHashtags: PropTypes.func,
  hashtags: PropTypes.array
}
