import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Message from './Message'
import Switch from '@material-ui/core/Switch'
import { ServerStyleSheets } from '@material-ui/styles'

export default class SearchToggle extends Component {

  constructor(props) {
    super(props)
    this.resetError = this.resetError.bind(this)
    this.state = {
      error: null
    }
  }

  toggle(e) {
    const totalTweets = this.props.searches.reduce((n, search) => n + search.tweetCount, 0) 
    if (! this.props.user.active) {
      this.setState({error: 'Your account is not active, please email the admin.'})
    } else if (totalTweets > this.props.user.tweetQuota) {
      this.setState({error: 
        `You are over your quota of ${this.props.user.tweetQuota} tweets.
        Delete one or more collections to start collecting again.`
      })
    } else {
      this.props.updateSearch({
        id: this.props.id,
        active: e.target.checked,
        archived: false
      })
    }
  }

  resetError() {
    this.setState({error: null})
  }

  render() {
    const title = this.props.active ? 'Stop Data Collection' : 'Start Data Collection'
    const color = this.props.active ? 'primary' : 'secondary'
    const msg = this.state.error ? <Message type="error" text={this.state.error} onClose={this.resetError} /> : ''

    return (
      <>
        <Switch className={ServerStyleSheets.Admin}
          checked={this.props.active}
          color={color}
          title={title}
          onChange={(e) => {this.toggle(e)}} />
        {msg}
      </>
    )
  }

}

SearchToggle.propTypes = {
  id: PropTypes.number,
  updateSearch: PropTypes.func,
  active: PropTypes.bool,
  user: PropTypes.object,
  searches: PropTypes.array,
}
