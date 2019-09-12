import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Switch from '@material-ui/core/Switch'

import style from './UserList.css'

export default class UserList extends Component {

  constructor() {
    super()
    this.toggleActive = this.toggleActive.bind(this)
    this.toggleAdmin = this.toggleAdmin.bind(this)
  }

  componentDidMount() {
    if (this.props.users.length === 0) {
      this.tick()
    }

    this.timerId = setInterval(() => {
      this.tick()
    }, 10000)

  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    this.props.getUsers()
  }

  toggleActive(user) {
    if (user.active) {
      this.props.deactivateUser(user)
    } else {
      this.props.activateUser(user)
    }
  }

  toggleAdmin(user) {
    if (user.isSuperUser) {
      this.props.deactivateAdmin(user)
    } else {
      this.props.activateAdmin(user)
    }
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
            <TableCell>Admin</TableCell>
            <TableCell>Quota</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {this.props.users.map(user => {
          const tweetCount = user.searches.map(s => s.tweetCount).reduce((a, b) => a + b, 0)
          return (
            <TableRow key={user.twitterScreenName}>
              <TableCell><img src={user.twitterAvatarUrl} /></TableCell>
              <TableCell><Link to={`/searches/${user.id}`}>{user.name}</Link></TableCell>
              <TableCell>{user.twitterScreenName}</TableCell>
              <TableCell>{user.searches.length}</TableCell>
              <TableCell>{tweetCount}</TableCell>
              <TableCell>
                <Switch
                  checked={user.active}
                  onChange={() => {this.toggleActive(user)}}
                  color="primary" />
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.isSuperUser}
                  onChange={() => {this.toggleAdmin(user)}}
                  color="primary" />
              </TableCell>
              <TableCell>
                <input value={user.tweetQuota} />
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
  activateUser: PropTypes.func,
  deactivateUser: PropTypes.func,
  activateAdmin: PropTypes.func,
  deactivateAdmin: PropTypes.func
}
