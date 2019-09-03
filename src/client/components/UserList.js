import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Switch from '@material-ui/core/Switch'

import style from './UserList.css'
import { updateUser } from '../actions/user';

export default class UserList extends Component {

  componentDidMount() {
    if (this.props.users.length === 0) {
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
    this.props.getUsers()
  }

  updateActive(user) {
    updateUser({id: user.id, active: false})
  }

  render() {
    return (
      <Table className={style.UserList}>
        <TableHead>
          <TableRow>
            <TableCell>Avatar</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Collections</TableCell>
            <TableCell>Tweets</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {this.props.users.map(user => {
          const tweetCount = user.searches.map(s => s.tweetCount).reduce((a, b) => a + b, 0)
          return (
            <TableRow key={user.twitterScreenName}>
              <TableCell><img src={user.twitterAvatarUrl} /></TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.twitterScreenName}</TableCell>
              <TableCell>{user.searches.length}</TableCell>
              <TableCell>{tweetCount}</TableCell>
              <TableCell>
                <Switch
                  onChange={this.updateActive(user)}
                  checked={user.active}
                  color="primary" />
              </TableCell>
            </TableRow>
          )
        })}
        </TableBody>
      </Table>
    )
  }
}

UserList.propTypes = {
  users: PropTypes.array,
  getUsers: PropTypes.func,
}
