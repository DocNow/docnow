import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Slider from '@material-ui/core/Slider'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TablePagination from '@material-ui/core/TablePagination'
import Tweet from '../Explore/Tweet'

import style from './Tweets.css' 

class TweetsBody extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
    this.state = {
      postsToShow: this.props.chunkSize,
      rangeValue: [0, 99],
      displayRetweets: this.props.displayRetweets,
    }
    this.tweets = this.props.tweets
    this.rendered = 0
    // NB. Page is handled as a property by default,
    // but it can also be passed as a prop, in which case 
    // the parent component should handle state update
    // to trigger render.
    this.page = 0
  }

  componentDidUpdate() {
    if (this.tweets.length > 0 && this.props.tweets.length > 0) {
      if (this.tweets[0].id !== this.props.tweets[0].id) {
        this.tweets = this.props.tweets
      }
    }
  }

  handlePageChange(e, p) {
    const offset = p * 100
    if (offset <= this.props.tweetCount) {
      this.props.getTweets(this.props.searchId, true, offset, p)
      this.page = p
    }
  }

  handleSlide(e, newValue) {
    this.setState({
      rangeValue: [newValue[0] - 1, newValue[1] - 1]
    })
  }

  displayRetweets(display) {
    this.setState({displayRetweets: display})
  }

  render() {
    let tweets = this.tweets
    // Reduce tweets based on selected range
    tweets = tweets.filter((t, i) => i >= this.state.rangeValue[0] && i <= this.state.rangeValue[1])

    const page = this.props.page ? this.props.page : this.page

    return (
      <div>
        <div className={style.Controls}>     
          <FormControl component="fieldset">
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={this.state.displayRetweets}
                  onChange={(e) => {this.displayRetweets(e.target.checked)}} value="disretw" />}
                label="Display Retweets"
              />
            </FormGroup>
          </FormControl>
          <div>
            <div style={{paddingTop: "40px"}}>
              <Slider
                value={[this.state.rangeValue[0] + 1, this.state.rangeValue[1] + 1]}
                valueLabelFormat={(v) => {
                  const c = v + (this.page * 100)
                  if (c > this.props.tweetCount) {
                    return this.props.tweetCount
                  }
                  return c
                }}
                onChange={(e, v) => {this.handleSlide(e, v)}}
                valueLabelDisplay="on"
                step={10}
                marks
                min={1}
                max={100}
              />
            </div>
            <TablePagination
              component="div"
              count={
                this.props.tweetCount
                ? this.props.tweetCount
                : 0
              }
              rowsPerPage={100}
              rowsPerPageOptions={[100]}
              labelRowsPerPage="Tweets per page:"
              page={page}
              onChangePage={(e, p) => {this.handlePageChange(e, p)} }
            />
          </div>
        </div>


        <div className={style.Holder}>{
          tweets
            .filter(t => this.state.displayRetweets || !t.retweet)
            .slice(0, this.state.postsToShow).map((t, i) => <Tweet key={`t${i}`} data={t} />)
        }
        </div>

      </div>
    )
  }
}

TweetsBody.defaultProps = {
  displayRetweets: true,
  chunkSize: 20
}

TweetsBody.propTypes = {
  searchId: PropTypes.string,
  displayRetweets: PropTypes.bool,
  chunkSize: PropTypes.number,
  tweets: PropTypes.array,
  tweetCount: PropTypes.number,
  getTweets: PropTypes.func,
  page: PropTypes.number
}

export default TweetsBody
