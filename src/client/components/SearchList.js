import moment from 'moment'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import DownloadOptions from '../containers/DownloadOptions'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import Trash from './Trash'
import SearchToggle from './SearchToggle'
import SearchPublic from './SearchPublic'

export default class SearchList extends Component {

  componentDidMount() {
    const userId = this.props.forUserId || this.props.user.id
    this.props.getSearches(userId)
  }

  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Tweet Count</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Last Update</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Public</TableCell>
            <TableCell>Archive</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {this.props.searches.map(search => {
          const created = moment(search.created).local().format('MMM D h:mm A')
          const updated = moment(search.updated).local().format('MMM D h:mm A')
          return (
            <TableRow key={search.id}>
              <TableCell>
                <Link to={`/search/${search.id}/`}>
                  {search.title}
                </Link>
              </TableCell>
              <TableCell>
                <ion-icon name="logo-twitter"></ion-icon>
                &nbsp;
                { search.tweetCount.toLocaleString() }
              </TableCell>
              <TableCell>
                {created}
              </TableCell>
              <TableCell>
                {updated}
              </TableCell>
              <TableCell>
                <SearchToggle
                  id={search.id}
                  search={search}
                  instanceTweetText={this.props.instanceTweetText}
                  user={this.props.user}
                  updateSearch={this.props.updateSearch} />
              </TableCell>
              <TableCell>
                <SearchPublic
                  id={search.id}
                  public={search.public}
                  user={this.props.user}
                  searches={this.props.searches}
                  updateSearch={this.props.updateSearch} />
               </TableCell>
               <TableCell>
                <DownloadOptions
                  id={search.id}
                  active={search.active}
                  archived={search.archived}
                  archiveStarted={search.archiveStarted}/>
              </TableCell>
              <TableCell>
                <Trash
                  id={search.id}
                  title={search.title}
                  deleteSearch={this.props.deleteSearch} />
              </TableCell>
            </TableRow>
          )
        })}
        </TableBody>
      </Table>
    )
  }
}

SearchList.propTypes = {
  searches: PropTypes.array,
  updateSearch: PropTypes.func,
  deleteSearch: PropTypes.func,
  getSearches: PropTypes.func,
  user: PropTypes.object,
  forUserId: PropTypes.number,
  instanceTweetText: PropTypes.string,
}