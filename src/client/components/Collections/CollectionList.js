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
import Typography from '@material-ui/core/Typography'

import FindMe from './FindMe'
import Intro from '../Intro'

import style from './CollectionList.css'

export default class CollectionList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      foundCollections: {}
    }
  }

  componentDidMount() {
    this.props.getFoundInSearches()
    this.props.getPublicSearches()
  }

  render() {
    return (
      <>
        <Grid container spacing={3} className={style.Header}>
          <Grid item xs={3}>
            <Typography variant="body1">
            </Typography>
          </Grid>
          <Grid item xs={6} className={style.Title}>
          <Typography variant="h2">COLLECTIONS</Typography>
          </Grid>
          <Grid item xs={3}>
            <FindMe user={this.props.user} />
          </Grid>
          <Grid item xs={12}>
            <Intro>
              { this.props.settings.instanceDescription }. All active collections being collected by our DocNow users are listed below. Use the Find Me <sup><small><b>beta</b></small></sup>&nbsp; feature to learn if your content is in a collection and how you can specify or revoke consent.
            </Intro>
          </Grid>
        </Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Title</b></TableCell>
              <TableCell><b>Tweets</b></TableCell>
              <TableCell><b>Created</b></TableCell>
              <TableCell><b>Last Update</b></TableCell>
              <TableCell><b>Collector</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {this.props.searches.map(search => {
            const created = moment(search.created).local().format('MMM D Y h:mm A')
            const updated = moment(search.updated).local().format('MMM D Y h:mm A')

            let rowStyle = style.NotFoundInSearch
            let foundCount = ''
            if (search.id in this.props.user.foundInSearches) {
              rowStyle = style.FoundInSearch
              foundCount = ` (${this.props.user.foundInSearches[search.id].length} are yours)`
            }
            return (
              <TableRow key={search.id} className={rowStyle}>
                <TableCell>
                  <Link to={`/collection/${search.id}/`}>
                    {search.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <ion-icon name="logo-twitter"></ion-icon>
                  &nbsp;
                  { search.tweetCount.toLocaleString() }
                  { foundCount }
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
  user: PropTypes.object,
  searches: PropTypes.array.isRequired,
  settings: PropTypes.object,
  forUserId: PropTypes.number,
  getPublicSearches: PropTypes.func.isRequired,
  getFoundInSearches: PropTypes.func.isRequired,
}
