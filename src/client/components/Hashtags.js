import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Search.css'
import Hashtag from './Hashtag'

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
    if (this.props.endpoint) {
      this.props.getHashtags(this.props.endpoint)
    }
  }

  render() {
    let loader = null
    if (this.props.hashtags.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={style.Box}>
          {loader}
          {this.props.hashtags.map(ht => (
            <Hashtag key={ht.hashtag} data={ht}/>
          ))}
        </div>
    )
  }
}

Hashtags.propTypes = {
  endpoint: PropTypes.string,
  getHashtags: PropTypes.func,
  hashtags: PropTypes.array
}
