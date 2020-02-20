import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DownloadOptions from '../../containers/DownloadOptions'
import Editable from '../Editable'
import SearchToggle from '../SearchToggle'
import Trash from '../Trash'
import moment from 'moment'

import style from './SearchInfo.css'

export default class SearchInfo extends Component {

  shouldComponentUpdate(nextProps) {
    if (nextProps.title === this.title) {
      return false
    } else {
      return true
    }
  }

  updateTitle(title) {
    this.props.updateSearch({id: this.props.search.id, title: title})
  }

  updateDescription(desc) {
    this.props.updateSearch({id: this.props.search.id, description: desc})
  }

  render() {
    const created = moment(this.props.search.created).local().format('MMM D h:mm A')
    const modified = moment(this.props.search.modified).local().format('MMM D h:mm A')
    return (
      <div className={style.SavedSearchInfo}>
        <div className={style.SavedSearchText}>
          <h2>
            <Editable
              text={this.props.title}
              update={(t) => {this.updateTitle(t)}} />
              <span className={style.SavedSearchButtons}>
                <SearchToggle
                  active={this.props.search.active}
                  id={this.props.search.id}
                  searches={this.props.searches}
                  user={this.props.user}
                  updateSearch={this.props.updateSearch} />
              </span>
          </h2>
          <span>Started {created}, last updated {modified}</span>
          <span className={style.AlignTrash}>
            <Trash />
          </span>
        </div>
        <DownloadOptions />
      </div>
    )
  }

}

SearchInfo.propTypes = {
  search: PropTypes.object,
  searches: PropTypes.array,
  user: PropTypes.object,
  title: PropTypes.string,
  description: PropTypes.string,
  updateSearch: PropTypes.func,
  createArchive: PropTypes.func
}
