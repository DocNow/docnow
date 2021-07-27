import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DataGrid } from '@material-ui/data-grid'
import { ButtonLabel } from '../../components/Label'
import moment from 'moment'

export default class ActionsBody extends Component {

  render() {
    if (this.props.search.actions) {

      // get current consent actions but ignore deletes (no tweets)
      const actions = this.props.search.actions.filter(a => (
        a.archived === null && a.tweet
      ))

      const columns = [
        {
          field: 'created',
          width: 200,
          headerName: 'Created',
          valueGetter: params => moment(params.value).local().format('MMM D h:mm:ss A'),
        },
        {
          field: 'user',
          width: 200,
          headerName: 'User',
          renderCell: params => {
            const tweet = params.getValue(params.id, 'tweet')
            return (
              <a href={`https://twitter.com/${tweet.screenName}`}>
                @{tweet.screenName}
              </a>
            )
          }
        },
        {
          field: 'tweet',
          headerName: 'Tweet',
          flex: 1,
          renderCell: params => {
            return (
              <a href={`https://twitter.com/${params.value.screenName}/status/${params.value.tweetId}`}>
                {params.value.text}
              </a>
            )
          }
        },
        {
          field: 'name',
          headerName: 'Action',
          width: 200,
          renderCell: params => (
            <ButtonLabel name={params.value} />
          )
        }
      ]

      return (
        <div style={{ height: 400, width: '100%'}}>
          <h2 style={{textAlign: "center"}}>Consent Actions</h2>
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
              <DataGrid 
                rows={actions}
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
