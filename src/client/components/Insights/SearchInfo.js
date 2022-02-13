import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'

import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

import DownloadOptions from '../../containers/DownloadOptions'
import SearchToggle from '../SearchToggle'
import SearchPublic from '../SearchPublic'
import Trash from '../Trash'
import Editable from '../Editable'


export default class SearchInfo extends Component {

  constructor(props) {
    super(props)
    this.editing = false
    this.state = {
      goHome: false
    }
  }

  setEditing(to) {
    this.editing = to
  }

  updateTitle(title) {
    const newTitle = title === '' ? 'untitled' : title
    this.props.updateSearch({id: this.props.search.id, title: newTitle})
  }

  updateDescription(desc) {
    this.props.updateSearch({id: this.props.search.id, description: desc})
  }

  delete(id) {
    this.props.deleteSearch(id)
    // navigate back to search list
    this.setState({goHome: true})
  }

  render() {
    if (! this.props.search || ! this.props.search.id ) {
      return <div />
    } else if (this.state.goHome) {
      return <Redirect to="/searches" push={true} />
    }
    const created = moment(this.props.search.created).local().format('LL')
    const minDate = moment(this.props.search.minDate).local().format('LLL')
    const maxDate = moment(this.props.search.maxDate).local().format('LLL')

    // only admins can change whether a search is public (a collection) or not
    const setPublicColumn = this.props.user.admin ? <TableCell>Public</TableCell> : ''
    let setPublicCell = ''
    if (this.props.user.admin) {
      setPublicCell = (
        <TableCell>
          <SearchPublic
            public={this.props.search.public}
            id={this.props.search.id}
            searches={this.props.searches}
            user={this.props.user}
            updateSearch={this.props.updateSearch} />
        </TableCell>
      )
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Tweet Count</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Tweet Time Range</TableCell>
            <TableCell>Active</TableCell>
            {setPublicColumn}
            <TableCell>Archive</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableRow>
          <TableCell>
            <Editable
              text={this.props.search.title}
              update={(t) => {this.updateTitle(t)}} />
          </TableCell>
          <TableCell>
            <ion-icon name="logo-twitter"></ion-icon>
            &nbsp;
            { this.props.search.tweetCount.toLocaleString() }
          </TableCell>
          <TableCell>
            {created}
          </TableCell>
          <TableCell>
            {minDate} - {maxDate}
          </TableCell>
          <TableCell>
            <SearchToggle
              search={this.props.search}
              instanceTweetText={this.props.instanceTweetText}
              academic={this.props.academic}
              user={this.props.user}
              updateSearch={this.props.updateSearch} />  
          </TableCell>
          {setPublicCell}
          <TableCell>
            <DownloadOptions
              id={this.props.search.id}
              active={this.props.search.active}
              archived={this.props.search.archived}
              archiveStarted={this.props.search.archiveStarted}/>
          </TableCell>
          <TableCell>
            <Trash
              id={this.props.search.id}
              deleteSearch={(id) => {this.delete(id)}} />
          </TableCell>
        </TableRow>
      </Table>
    )
  }

}

SearchInfo.propTypes = {
  search: PropTypes.object,
  searches: PropTypes.array,
  user: PropTypes.object,
  title: PropTypes.string,
  description: PropTypes.string,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.boolean,
  updateSearch: PropTypes.func,
  deleteSearch: PropTypes.func,
  createArchive: PropTypes.func
}
