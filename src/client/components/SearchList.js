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
import Intro from './Intro'

export default class SearchList extends Component {

  componentDidMount() {
    const userId = this.props.forUserId || this.props.user.id
    this.props.getSearches(userId)
    this.timerId = setInterval(() => {
      this.tick()
    }, 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    if (this.props.searches) {
      const ids = this.props.searches.filter(s => s.active).map(s => s.id)
      if (ids.length > 0) {
        this.props.getSearchesCounts(ids)
      }
    } 
  }

  render() {

    const setPublicColumn = this.props.user.admin ?  <TableCell>Public</TableCell> : ''
    return (
      <>
      <Intro>
        Activate a search to start collecting, view insights <sup>beta</sup> into collections, and download Tweet IDs for sharing.
      </Intro>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Tweet Count</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Active</TableCell>
            {setPublicColumn}
            <TableCell>Archive</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {this.props.searches.map(search => {
          const created = moment(search.created).local().format('LL')

          // only admins can set whether a search is a public collection or not
          let setPublicCell = ''
          if (this.props.user.admin) {
            setPublicCell = (
              <TableCell>
                <SearchPublic
                  id={search.id}
                  public={search.public}
                  user={this.props.user}
                  searches={this.props.searches}
                  updateSearch={this.props.updateSearch} />
              </TableCell>
            )
          }

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
                <SearchToggle
                  id={search.id}
                  search={search}
                  instanceTweetText={this.props.instanceTweetText}
                  academic={this.props.academic}
                  user={this.props.user}
                  updateSearch={this.props.updateSearch} />
              </TableCell>
              {setPublicCell}
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
      </>
    )
  }
}

SearchList.propTypes = {
  searches: PropTypes.array,
  updateSearch: PropTypes.func,
  deleteSearch: PropTypes.func,
  getSearches: PropTypes.func,
  getSearchesCounts: PropTypes.func,
  user: PropTypes.object,
  forUserId: PropTypes.number,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.boolean
}
