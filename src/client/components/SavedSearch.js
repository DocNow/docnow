import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Card.css'
import Webpage from './Webpage'

export default class SavedSearch extends Component {

  componentWillMount() {
    this.props.getWebpages(this.props.searchId)
    this.props.getQueueStats(this.props.searchId)
  }

  render() {
    return (
      <div className={style.CardHolder}>
      {this.props.webpages.map((w) => (
        <Webpage
          key={w.url}
          url={w.url}
          title={w.title}
          image={w.image}
          count={w.count}
          description={w.description}
          keywords={w.keywords} />
      ))}
      </div>
    )
  }
}

SavedSearch.propTypes = {
  'searchId': PropTypes.string,
  'webpages': PropTypes.array,
  'getWebpages': PropTypes.func,
  'getQueueStats': PropTypes.func
}
