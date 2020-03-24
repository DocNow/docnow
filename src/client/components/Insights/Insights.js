import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import TweetEmbed from 'react-tweet-embed'
import TweetTabBar from './TweetTabBar'
import HashtagChart from '../Explore/HashtagChart'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'

import card from '../Card.css'
import style from './Insights.css'

function getHostName(url) {
  let hostname = new URL(url).host
  hostname = hostname.replace(/^www\./, '')
  return hostname
}

export default class Insights extends Component {
  constructor(props) {
    super(props)
    this.state = {
      randomTweet: 0
    }
  }

  componentDidMount() {
    this.props.resetTwitterSearch()
    this.tick()
    this.props.getUsers(this.props.searchId)
    this.props.getTweets(this.props.searchId)
    this.props.getImages(this.props.searchId)
    this.props.getVideos(this.props.searchId)
    this.props.getWebpages(this.props.searchId)
    this.props.getHashtags(this.props.searchId)
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
    this.props.resetTwitterSearch()
  }

  tick() {
    this.props.getSearch(this.props.searchId)
  }

  showRandomTweet() {
    if (this.props.search.tweets.length > 0) {
      this.setState({randomTweet: Math.floor(Math.random() * this.props.search.tweets.length)})
    }
    return false
  }

  render() {

    // don't render until we at least know the title of the search
    if (! this.props.search.title) {
      return <div />
    }

    let tweetIds = []
    let sampleTweet = ''
    if (this.props.search.tweets.length > 0) {
      tweetIds = this.props.search.tweets.map((t) => {return t.id})
      sampleTweet = (
        <div>
          <TweetEmbed id={tweetIds[this.state.randomTweet]} options={{cards: 'hidden'}} />
          <IconButton aria-label="show random tweet" onClick={() => {
            this.showRandomTweet()
          }}>
            <ion-icon name="refresh"></ion-icon>
          </IconButton>
        </div>
      )
    }


    return (
      <div className={style.Insights}>

        <SearchInfo
          title={this.props.search.title}
          search={this.props.search}
          searches={this.props.searches}
          user={this.props.user}
          updateSearch={this.props.updateSearch}
          createArchive={this.props.createArchive} />

        <TweetTabBar />

      <div className={style.InsightsCard}>
        <h2>{parseInt(this.props.search.tweetCount, 10).toLocaleString()} tweets</h2>
        <div className={card.CardHolder}>
          <div className={card.SavedLongCard}>
            <div style={{display: 'flex'}}>
              {sampleTweet}
              <Card outlined className={card.Card} >
                <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
                  <HashtagChart
                    addSearchTerm={() => { return false }}
                    hashtags={this.props.search.hashtags}
                    query={[]} />
                </CardContent>
                <CardActions>
                  <h2 className={card.PlaceHeader}>Hashtags</h2>
                </CardActions>
              </Card>
            </div>
          </div>
        </div><hr/>
        <div className={style.ViewInsights}><h2><Link to={`/search/${this.props.searchId}/tweets/`}>View Tweet Insights &rarr;</Link></h2>
        </div>
      </div>

      <div className={style.InsightsCard}>
        <h2>{this.props.search.userCount.toLocaleString()} users</h2>
        <div className={card.CardHolder}>
          <div className={card.SavedLongCard}>
           {this.props.search.users.slice(0, 100).map((u) => {
             return (
               <a key={u.screenName} href={`https://twitter.com/${u.screenName}`} target="_new">
                 <img title={`@${u.screenName} (${u.tweetsInSearch} tweets)`} src={u.avatarUrl} />
               </a>
             )
           })}
          </div><br/>
        </div><hr/>
        <div className={style.ViewInsights}><h2><Link to={`/search/${this.props.searchId}/users/`}>View User Insights &rarr;</Link></h2>
        </div>
      </div>

      <div className={style.InsightsCard}>
       <h2>{parseInt(this.props.search.urlCount, 10).toLocaleString()} Webpages</h2>
        <div className={card.CardHolder}>
          <div className={card.SavedImageCard}>
            {this.props.webpages.slice(0, 25).map(w => (
              <a key={w.url} rel="noopener noreferrer" target="_blank" href={w.url}>
                <img src={w.image} /><br />
                {getHostName(w.url)}
             </a>
            ))}
          </div>
          </div><hr/>
          <div className={style.ViewInsights}><h2><Link to={`/search/${this.props.searchId}/webpages/`}>View Webpage Insights &rarr;</Link></h2>
        </div>
      </div>

      <div className={style.InsightsCard}>
      <h2>{parseInt(this.props.search.imageCount, 10).toLocaleString()} Images</h2>
        <div className={card.SavedImageCard}>
          {this.props.search.images.slice(0, 25).map(i => (
             <img key={i.url} src={i.url} />
          ))}
        </div><hr/>
        <div className={style.ViewInsights}><h2><Link to={`/search/${this.props.searchId}/images/`}>View Image Insights &rarr;</Link></h2>
        </div>
      </div>

      <div className={style.InsightsCard}>
      <h2>{parseInt(this.props.search.videoCount, 10).toLocaleString()} Videos</h2>
        <div className={card.SavedImageCard}>
          {this.props.search.videos.slice(0, 25).map(v => (
            <video controls key={v.url} src={v.url} />
          ))}
        </div><hr/>
        <div className={style.ViewInsights}><h2><Link to={`/search/${this.props.searchId}/videos/`}>View Video Insights &rarr;</Link></h2>
        </div>
      </div>
    </div>
    )
  }
}

Insights.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  searches: PropTypes.array,
  user: PropTypes.object,
  webpages: PropTypes.array,
  getSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getUsers: PropTypes.func,
  getVideos: PropTypes.func,
  getImages: PropTypes.func,
  getWebpages: PropTypes.func,
  resetTwitterSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  createArchive: PropTypes.func,
  getHashtags: PropTypes.func,
}
