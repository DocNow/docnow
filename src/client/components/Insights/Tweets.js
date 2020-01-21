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
import Fab from '@material-ui/core/Fab'

import style from './Tweets.css' 

class Tweets extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
    this.state = {
      postsToShow: this.props.chunkSize,
      rangeValue: [1, 100],
      displayRetweets: this.props.displayRetweets,
      tweets: this.props.search.tweets,
      tweetCount: this.props.search.tweetCount,
      searchUpdated: false
    }
  }

  componentDidUpdate(prevState) {
    if (this.state.tweets.length > 0 && this.props.search.tweets.length > 0) {
      if (this.state.tweets[0].id !== this.props.search.tweets[0].id) {
        this.setState({
          tweets: this.state.tweets.concat(this.props.search.tweets)
        })
      }
    }
    if (prevState.tweetCount !== 0 && prevState.tweetCount < this.state.tweetCount ) {
      this.setState({
        searchUpdated: true
      })
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

  render() {
    let tweets = this.state.tweets
    // Reduce tweets based on selected range
    tweets = tweets.filter((t, i) => i > this.state.rangeValue[0] && i <= this.state.rangeValue[1] + 1)

    let updateSearch = null
    if (this.state.searchUpdated) {
      updateSearch = (
        <div className={style.Refresh}>
          <Fab size="medium" title="Refresh"
            tabIndex="0">
            <ion-icon name="refresh"></ion-icon>
          </Fab>
          Search updated! Click here to refresh tweets.
        </div>
      )
    }    

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
            <p>Limit number of tweets</p>

            <Slider
              value={this.state.rangeValue}
              onChange={(e, v) => {this.handleSlide(e, v)}}
              valueLabelDisplay="auto"
              step={10}
              marks
              min={1}
              max={this.state.tweets.length}
            />
          </div>
          {updateSearch} 
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
