import moment from 'moment'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import Trash from './Trash'
import SearchToggle from './SearchToggle'

export default class SearchList extends Component {

  componentDidMount() {
    // if we don't have any list of searches or they are looking for a specific 
    // users searches then fire off a request to get them immediately.
    if (this.props.searches.length === 0 || this.props.forUserId) {
      this.tick()
    }
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    console.log('tick')
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
            <TableCell>Actions</TableCell>
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
                  active={search.active}
                  user={this.props.user}
                  updateSearch={this.props.updateSearch} />
              </TableCell>
              <TableCell>
                <Trash
                  id={search.id}
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
  forUserId: PropTypes.string,
}
