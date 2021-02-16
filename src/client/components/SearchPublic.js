import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Switch from '@material-ui/core/Switch'
import { ServerStyleSheets } from '@material-ui/styles'

export default class SearchPublic extends Component {

  toggle(e) {
    this.props.updateSearch({
      id: this.props.id,
      public: e.target.checked ? new Date() : null,
    })
  }

  render() {
    const title = this.props.public ? 'Make Private' : 'Make Public'
    const color = this.props.public ? 'primary' : 'secondary'

    return (
      <Switch className={ServerStyleSheets.Admin}
        checked={this.props.public !== null}
        color={color}
        title={title}
        onChange={(e) => {this.toggle(e)}} />
    )
  }

}

SearchPublic.propTypes = {
  id: PropTypes.number,
  updateSearch: PropTypes.func,
  public: PropTypes.instanceOf(Date),
  user: PropTypes.object,
  searches: PropTypes.array,
}