import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import style from './UserList.css'
import { ServerStyleSheets } from '@material-ui/styles'

export default class UserList extends Component {

  constructor() {
    super()
    this.toggleActive = this.toggleActive.bind(this)
    this.toggleAdmin = this.toggleAdmin.bind(this)
    this.udpateQuota = this.updateQuota.bind(this)
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

  updateQuota(user, quota) {
    this.props.updateQuota(user, quota)
  }

  render() {
    return (
      <Table className={style.UserList}>
        <TableHead>
          <TableRow>
            <TableCell className={style.Avatar}>Avatar</TableCell>
            <TableCell className={style.Username}>Username</TableCell>
            <TableCell className={style.Name}>Name</TableCell>
            <TableCell className={style.Collections}>Collections</TableCell>
            <TableCell className={style.Tweets}>Tweets</TableCell>
            <TableCell className={style.Active}>Active</TableCell>
            <TableCell className={style.Admin}>Admin</TableCell>
            <TableCell className={style.Quota}>Quota</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {this.props.users.map(user => {
          const tweetCount = user.searches.map(s => s.tweetCount).reduce((a, b) => a + b, 0)
          return (
            <TableRow key={user.twitterScreenName}>
              <TableCell className={style.Avatar}><a href={`https://twitter.com/${user.twitterScreenName}`}><img src={user.twitterAvatarUrl} /></a></TableCell>
              <TableCell className={style.Username}><Link to={`/searches/${user.id}`}>{user.twitterScreenName}</Link></TableCell>
              <TableCell className={style.Name}>{user.name}</TableCell>
              <TableCell className={style.Collections}>{user.searches.length}</TableCell>
              <TableCell className={style.Tweets}>{tweetCount}</TableCell>
              <TableCell className={style.Active}>
                <Switch
                  checked={user.active}
                  onChange={() => {this.toggleActive(user)}}
                  color="primary" />
              </TableCell>
              <TableCell className={ServerStyleSheets.Admin}>
                <Switch
                  checked={user.isSuperUser}
                  onChange={() => {this.toggleAdmin(user)}}
                  color="primary" />
              </TableCell>
              <TableCell className={style.Quota}>
                <TextField
                  className={style.TweetQuota}
                  defaultValue={user.tweetQuota}
                  onChange={(e) => {this.updateQuota(user, e.target.value)}} />
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
  deactivateAdmin: PropTypes.func,
  updateQuota: PropTypes.func
}
