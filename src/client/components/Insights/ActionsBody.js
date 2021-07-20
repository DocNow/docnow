import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import moment from 'moment'

export default class ActionsBody extends Component {

  render() {
    if (this.props.search.actions) {

      // get current consent actions and ignore deletes (no tweets)
      const actions = this.props.search.actions.filter(a => (
        a.archived === null && a.tweet
      ))

      return (
        <div>
          <h2 style={{textAlign: "center"}}>Consent Actions</h2>
          <Table>
            <TableHead> 
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Tweet</TableCell>
                <TableCell width="100">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actions.map(a => (
                <TableRow key={`action-${a.id}`}>
                  <TableCell width={120}>
                    {moment(a.created).local().format('MMM D h:mm:ss A')}
                    </TableCell>
                  <TableCell>
                    <a href={`https://twitter.com/${a.tweet.screenName}`}>
                      @{a.tweet.screenName}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a href={`https://twitter.com/i/status/${a.tweet.tweetId}`}>
                      {a.tweet.text}
                    </a>
                  </TableCell>
                  <TableCell>
                    {a.name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    } else {
      return <div />
    }
  }
}

ActionsBody.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object
}
