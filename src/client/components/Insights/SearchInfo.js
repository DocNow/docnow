import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DownloadOptions from '../../containers/DownloadOptions'
import SearchToggle from '../SearchToggle'
import Trash from '../Trash'
import moment from 'moment'
import Editable from '../Editable'
import { Redirect } from 'react-router-dom'

import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

// import style from './SearchInfo.css'

export default class SearchInfo extends Component {
  constructor(props) {
    super(props)
    this.editing = false
    this.state = {
      goHome: false
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.title === this.title) {
      return false
    } else {
      return true
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
    if (this.state.goHome) {
      return <Redirect to="/searches" push={true} />
    }
    const created = moment(this.props.search.created).local().format('MMM D h:mm A')
    const modified = moment(this.props.search.modified).local().format('MMM D h:mm A')
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Tweet Count</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Last Update</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Archive</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableRow>
          <TableCell>
            <Editable
              text={this.props.title}
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
            {modified}
          </TableCell>
          <TableCell>
            <SearchToggle
              active={this.props.search.active}
              id={this.props.search.id}
              searches={this.props.searches}
              user={this.props.user}
              updateSearch={this.props.updateSearch} />  
          </TableCell>
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
  updateSearch: PropTypes.func,
  deleteSearch: PropTypes.func,
  createArchive: PropTypes.func
}
