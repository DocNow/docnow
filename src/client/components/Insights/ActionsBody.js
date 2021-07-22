import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DataGrid } from '@material-ui/data-grid';
import moment from 'moment'

export default class ActionsBody extends Component {

  render() {
    if (this.props.search.actions) {
      // get current consent actions and ignore deletes (no tweets)
      const actions = this.props.search.actions.filter(a => (
        a.archived === null && a.tweet
      ))

      // reshape as a data table
      const rows = actions.map(a => ({
        id: a.id,
        created: a.created,
        user: a.tweet.screenName,
        tweetId: a.tweet.tweetId,
        tweetText: a.tweet.text,
        action: a.name
      }))

      const columns = [
        {
          field: 'created',
          width: 100,
          headerName: 'Created',
          valueGetter: params => moment(params.value).local().format('MMM D h:mm:ss A'),
        },
        {
          field: 'user',
          width: 200,
          headerName: 'User',
          renderCell: params => {
            return (
              <a href={`https://twitter.com/${params.value}`}>
                @{params.value}
              </a>
            )
          }
        },
        {
          field: 'tweetId',
          headerName: 'Tweet',
          flex: 1,
          renderCell: params => {
            const user = params.getValue(params.id, 'user')
            const tweetId = params.getValue(params.id, 'tweetId')
            const tweetText = params.getValue(params.id, 'tweetText')
            return (
              <a href={`https://twitter.com/${user}/status/${tweetId}`}>
                {tweetText}
              </a>
            )
          }
        },
        {
          field: 'action',
          width: 200,
          headerName: 'Action',
        }
      ]

      return (
        <div style={{ height: 400, width: '100%'}}>
          <h2 style={{textAlign: "center"}}>Consent Actions</h2>
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
              <DataGrid 
                rows={rows}
                columns={columns}
                pageSize={25} />
            </div>
          </div>
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
