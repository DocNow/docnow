import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Editable from '../Editable'
import moment from 'moment'
import style from '../../styles/SavedSearchInfo.css'
import sl from '../../styles/SearchList.css'

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
          </h2>
          <p>
            <Editable
              text={this.props.description}
              update={(d) => {this.updateDescription(d)}}
              placeholder="Please enter a description for your saved search." />
          </p>
          <p>Search started on {created}, last updated at {modified}</p>
        </div>
        <div className={style.SavedSearchButtons}>
          <div className={sl.GridActionsInner}>
            <label className={sl.Switch}>
              <input type="checkbox" />
              <span className={sl.Slider + ' ' + sl.Round} />
            </label>
            <div className={sl.GridActionsInner} title="delete">
              <a href="">
                <i className="fa fa-trash" className={sl.Trash + ' fa fa-trash'} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

SearchInfo.propTypes = {
  search: PropTypes.object,
  title: PropTypes.string,
  description: PropTypes.string,
  updateSearch: PropTypes.func
}
