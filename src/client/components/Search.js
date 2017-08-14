import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Search extends Component {

  componentDidMount() {
    this.props.searchTwitter(this.props.q)
  }

  render() {
    return (<div/>)
  }

}

Search.propTypes = {
  q: PropTypes.string,
  searchTwitter: PropTypes.func
}
