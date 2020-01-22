import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'
import TweetEmbed from 'react-tweet-embed'
import Slider from '@material-ui/core/Slider'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TablePagination from '@material-ui/core/TablePagination';

import style from './Tweets.css' 

class Tweets extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
    this.state = {
      postsToShow: this.props.chunkSize,
      rangeValue: [1, 100],
      displayRetweets: this.props.displayRetweets,
      searchUpdated: false
    }
    this.tweets = this.props.search.tweets
    this.page = 0
  }

  componentDidUpdate() {
    if (this.tweets.length > 0 && this.props.search.tweets.length > 0) {
      if (this.tweets[0].id !== this.props.search.tweets[0].id) {
        this.tweets = this.props.search.tweets
      }
    }
  }

  componentDidMount() {
    window.addEventListener(`scroll`, () => this.handleScroll())
    this.tick()
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    window.removeEventListener(`scroll`, () => this.handleScroll())
    clearInterval(this.timerId)
  }

  tick() {
    this.props.getSearch(this.props.searchId)
    if (this.props.search.tweets.length === 0) {
      this.props.getTweets(this.props.searchId)
    }
  }

  update() {
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.scrollY + window.innerHeight)
    if (distanceToBottom < 150) {
      this.setState({
        postsToShow: this.state.postsToShow + this.props.chunkSize
      })
    }
    this.ticking = false
  }

  handleScroll() {
    if (!this.ticking) {
      this.ticking = true
      requestAnimationFrame(() => this.update())
    }
  }

  handleSlide(e, newValue) {
    this.setState({
      rangeValue: newValue,
      postsToShow: this.props.chunkSize
    })
  }

  displayRetweets(display) {
    this.setState({displayRetweets: display})
  }

  handlePageChange(e, p) {
    const offset = p * 100
    if (offset <= this.props.search.tweetCount) {
      this.props.getTweets(this.props.searchId, true, offset)
      this.page = p
    }    
  }

  render() {
    let tweets = this.tweets
    // Reduce tweets based on selected range
    tweets = tweets.filter((t, i) => i > this.state.rangeValue[0] && i <= this.state.rangeValue[1] + 1)

    return (
      <div>
        <SearchInfo
          title={this.props.search.title}
          description={this.props.search.description}
          search={this.props.search}
          updateSearch={this.props.updateSearch} />

        <BackButton 
          searchId={this.props.searchId}
          navigateTo={this.props.navigateTo}/>

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
                value={this.state.rangeValue}
                valueLabelFormat={(v) => {
                  const c = v + (this.page * 100)
                  if (c > this.props.search.tweetCount) {
                    return this.props.search.tweetCount
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
                this.props.search.tweetCount
                ? this.props.search.tweetCount
                : 0
              }
              rowsPerPage={100}
              rowsPerPageOptions={[100]}
              labelRowsPerPage="Tweets per page:"
              page={this.page}
              onChangePage={(e, p) => {this.handlePageChange(e, p)} }
            />
          </div>
        </div>


        <div className={style.Holder}>{
          tweets
            .filter(t => this.state.displayRetweets || !t.retweet)
            .slice(0, this.state.postsToShow).map((t, i) => {
              return <TweetEmbed key={`t${i}`} id={t.id} />
            })
        }</div>

      </div>
    )
  }
}

Tweets.defaultProps = {
  displayRetweets: true,
  chunkSize: 20
}

Tweets.propTypes = {
  displayRetweets: PropTypes.bool,
  chunkSize: PropTypes.number,
  searchId: PropTypes.string,
  search: PropTypes.object,
  getTweets: PropTypes.func,
  getSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  navigateTo: PropTypes.func
}

export default Tweets
