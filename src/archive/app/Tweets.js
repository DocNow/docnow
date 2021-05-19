import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {TwitterTweetEmbed} from 'react-twitter-embed'
import Slider from '@material-ui/core/Slider'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

import style from '../../client/components/Insights/Tweets.css'

const Tweets = (props) => {
  const chunkSize = 20
  const [range, setRange] = useState([0, props.tweetCount - 1])
  const [displayRetweets, setDisplayRetweets] = useState(true)
  const [postsToShow, setPostsToShow] = useState(chunkSize)

  let tweets = props.tweets

  const handleSlide = (e, newValue) => {
    setRange([newValue[0] - 1, newValue[1] - 1])
    const chunk = newValue[1] - newValue[0] < chunkSize ? newValue[1] - newValue[0] : chunkSize
    setPostsToShow(chunk)
  }

  const showMoreTweets = () => {
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.scrollY + window.innerHeight)
    if (distanceToBottom < 150) {
      // eslint-disable-next-line no-use-before-define
      window.removeEventListener(`scroll`, handleScroll)
      if (postsToShow + chunkSize < range[1] - range[0]) {
        setPostsToShow(postsToShow + chunkSize)
      }
    }
  }

  const handleScroll = () => {
    requestAnimationFrame(() => showMoreTweets())
  }

  const doneLoading = (i) => {
    if (i === postsToShow - 1) {
      window.addEventListener('scroll', handleScroll)
    }
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })
  
  tweets = props.tweets.filter((t, i) => i >= range[0] && i <= range[1])

  return (<div>
    <div className={style.Controls}>     
      <FormControl component="fieldset">
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={displayRetweets}
              onChange={(e) => {setDisplayRetweets(e.target.checked)}} value="disretw" />}
            label="Display Retweets"
          />
        </FormGroup>
      </FormControl>
      <div>
        <div style={{paddingTop: "40px"}}>
          <Slider
            value={[range[0] + 1, range[1] + 1]}
            onChange={(e, v) => {handleSlide(e, v)}}
            valueLabelDisplay="on"
            step={10}
            marks
            min={1}
            max={props.tweetCount}
          />
        </div>
      </div>
    </div>


    <div style={{margin: "auto", width: "30%"}}>{
      tweets
        .filter(t => displayRetweets || !t.retweet)
        .slice(0, postsToShow)
        .map((t, i) => <div key={`t${i}`}><span>{props.tweets.reduce((pos, tw, p) => {
          if (tw.id === t.id) {
            // eslint-disable-next-line no-param-reassign
            pos = p
          }
          return pos
        }, 0)}</span><TwitterTweetEmbed tweetId={t.id} onLoad={() => doneLoading(i)} /></div>)
    }
    </div>

  </div>)
}

Tweets.propTypes = {
  tweets: PropTypes.array,
  tweetCount: PropTypes.number
}

export default Tweets
