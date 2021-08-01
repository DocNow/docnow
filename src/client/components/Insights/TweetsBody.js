import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import Tweet from '../Explore/Tweet'

import style from './Tweets.css' 

function PaginationActions(props) {
  const { count, page, tweetsPerPage, onChangePage } = props

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0)
  }

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1)
  }

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1)
  }

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / tweetsPerPage) - 1))
  }

  return (
    <>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / tweetsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / tweetsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </>
  )
}

PaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  tweetsPerPage: PropTypes.number.isRequired,
}

class TweetsBody extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
    this.state = {
      rangeValue: [0, 99],
      displayRetweets: this.props.displayRetweets,
    }
    this.tweetsPerPage = 100
    this.rendered = 0
    // NB. Page is handled as a property by default,
    // but it can also be passed as a prop, in which case 
    // the parent component should handle state update
    // to trigger render.
    this.page = 0
  }

  handlePageChange(e, p) {
    const offset = p * 100
    if (offset <= this.props.tweetCount) {
      this.props.getTweets(this.props.searchId, true, offset, p)
      this.page = p
    }
  }

  displayRetweets(display) {
    this.setState({displayRetweets: display})
  }

  render() {
    const page = this.props.page ? this.props.page : this.page
    const totPages = Math.max(0, Math.ceil(this.props.tweetCount / this.tweetsPerPage))
    const from = (page * this.tweetsPerPage) + 1
    const to = this.props.tweetCount !== -1 ? Math.min(this.props.tweetCount, (page + 1) * this.tweetsPerPage) : (page + 1) * this.tweetsPerPage

    return (
      <div>
        <div className={style.Controls}> 
          <Grid container spacing={0} >
            <Grid item xs={3}>
              <Checkbox checked={this.state.displayRetweets}
                onChange={(e) => {this.displayRetweets(e.target.checked)}} value="disretw" />
              Display Retweets
            </Grid>
            <Grid item xs={9} style={{textAlign: 'right'}}>
              {from}-{to} of {this.props.tweetCount}
              <PaginationActions 
                count={this.props.tweetCount}
                page={page}
                tweetsPerPage={this.tweetsPerPage}
                onChangePage={(e, p) => {this.handlePageChange(e, p)} } />
              Jump to:&nbsp;
              <Select
                value={page}
                onChange={(e) => {this.handlePageChange(e, e.target.value)}}
              >
                {Array.from(Array(totPages).keys()).map(p => {
                  const f = (p * this.tweetsPerPage) + 1
                  const t = this.props.tweetCount !== -1 ? Math.min(this.props.tweetCount, (p + 1) * this.tweetsPerPage) : (p + 1) * this.tweetsPerPage
                  const val = `${f}-${t}`
                  return <MenuItem key={p} value={p}>{val}</MenuItem>
                })}
              </Select>
            </Grid>
          </Grid> 
        </div>


        <div className={style.Holder}>{
          this.props.tweets
            .filter(t => this.state.displayRetweets || !t.retweet)
            .map((t, i) => <Tweet key={`t${i}`} data={t} />)
        }
        </div>

      </div>
    )
  }
}

TweetsBody.defaultProps = {
  displayRetweets: true,
}

TweetsBody.propTypes = {
  searchId: PropTypes.number,
  displayRetweets: PropTypes.bool,
  tweets: PropTypes.array,
  tweetCount: PropTypes.number,
  getTweets: PropTypes.func,
  page: PropTypes.number
}

export default TweetsBody
