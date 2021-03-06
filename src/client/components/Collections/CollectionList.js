import moment from 'moment'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import style from './CollectionList.css'

export default class CollectionList extends Component {

  componentDidMount() {
    this.tick()
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    this.props.getPublicSearches()
  }

  render() {    
    return (
      <>
        <Grid container spacing={3} className={style.Header}>
          <Grid item xs={9}>
            <Typography variant="body1">
              { this.props.settings.instanceDescription }
            </Typography>
          </Grid>
          <Grid item xs={3}>
          <Button variant="contained" color="primary" className={style.FindMeBtn}>
            Find me
          </Button>
          </Grid>
          <Grid item xs={12} className={style.Title}>
            <Typography variant="h2">Active Collections</Typography>
          </Grid>
        </Grid>
        <Table>
          <TableHead>
            <TableRow>            
              <TableCell>Title</TableCell>
              <TableCell>Tweet Count</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Update</TableCell>
              <TableCell>Collector</TableCell>
              <TableCell>Contact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {this.props.searches.map(search => {
            const created = moment(search.created).local().format('MMM D h:mm A')
            const updated = moment(search.updated).local().format('MMM D h:mm A')
            const email = search.creator.email
              ? search.creator.email
              : 'No email provided.'
            return (
              <TableRow key={search.id}>
                <TableCell>
                  <Link to={`/collection/${search.id}/`}>
                    {search.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <ion-icon name="logo-twitter"></ion-icon>
                  &nbsp;
                  { search.tweetCount.toLocaleString() }
                </TableCell>
                <TableCell>
                  {search.userCount}
                </TableCell>
                <TableCell>
                  {created}
                </TableCell>
                <TableCell>
                  {updated}
                </TableCell>
                <TableCell>
                  <a href={`https://twitter.com/${search.creator.twitterScreenName}`}>
                    {search.creator.twitterScreenName}
                  </a>
                </TableCell>
                <TableCell>{email}</TableCell>
              </TableRow>
            )
          })}
          </TableBody>
        </Table>
      </>
    )
  }
}

CollectionList.propTypes = {
  searches: PropTypes.array.isRequired,
  settings: PropTypes.object,
  forUserId: PropTypes.number,
  getPublicSearches: PropTypes.func.isRequired
}
