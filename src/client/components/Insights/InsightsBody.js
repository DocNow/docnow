import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import UserList from '../Explore/UserList'
import HashtagChart from '../Explore/HashtagChart'
import ImageList from '../Explore/ImageList'
import VideoList from '../Explore/VideoList'
import Tweet from '../Explore/Tweet'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'

import card from '../Card.css'
import style from '../Explore/Search.css'
import insightsStyle from './Insights.css'
import exploreStyles from '../Explore/Explore.css'

import docImg from '../../images/doc.png'

export default class InsightsBody extends Component {
  makeEmptyCardFor(type) {
    return (<Card raised className={card.Card}>
      <CardContent className={card.NoPadding}>
        <span className={exploreStyles.Loader}>
          <ion-icon name="cloud-outline"></ion-icon>
        </span>
      </CardContent>
      <CardActions className={card.CardActions}>
          <h2 className={insightsStyle.CardLink}>
            This search has no {type}
          </h2>
        </CardActions>
    </Card>)
  }

  getHostName(url) {
    let hostname = new URL(url).host
    hostname = hostname.replace(/^www\./, '')
    return hostname
  }

  render() {
    const webpageCard = this.props.search.urlCount <= 0
      ? this.makeEmptyCardFor("webpages")
      : (<Card raised className={card.Card} >
        <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
          {this.props.webpages.slice(0, 50).map((w, i) => {
            if (w.image) {
              return <div key={`wp${i}`} className={insightsStyle.WebPreview}>
                <a key={w.url} rel="noopener noreferrer" target="_blank" href={w.url}>
                  <span><img src={w.image} width="250" onError={(e) => {
                    e.target.src = docImg
                  }} /></span>
                  {this.getHostName(w.url)}
                </a>
              </div>
            }
          })}
        </CardContent>

        <CardActions className={card.CardActions}>
          <h2 className={insightsStyle.CardLink}>
            <Link to={`/search/${this.props.searchId}/webpages/`}>
              View {parseInt(this.props.search.urlCount, 10).toLocaleString()} Webpages &rarr;
            </Link>
          </h2>
        </CardActions>
      </Card>)

    const imageCard = this.props.search.imageCount <= 0
      ? this.makeEmptyCardFor("images")
      : (<Card raised className={card.Card}>
        <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
          <ImageList images={this.props.search.images.slice(0, 50)} />
        </CardContent>

        <CardActions className={card.CardActions}>
          <h2 className={insightsStyle.CardLink}>
            <Link to={`/search/${this.props.searchId}/images/`}>
              View {parseInt(this.props.search.imageCount, 10).toLocaleString()} Images &rarr;
            </Link>
          </h2>
        </CardActions>
      </Card>)

    const videoCard = this.props.search.videoCount <= 0
    ? this.makeEmptyCardFor("videos")
    : (<Card raised className={card.Card} >
      <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
        <VideoList videos={this.props.search.videos.slice(0, 50)} />
      </CardContent>

      <CardActions className={card.CardActions}>
        <h2 className={insightsStyle.CardLink}>
          <Link to={`/search/${this.props.searchId}/videos/`}>
            View {parseInt(this.props.search.videoCount, 10).toLocaleString()} Videos &rarr;</Link>
        </h2>
      </CardActions>
    </Card>)

    return (
      <div className={card.CardHolder} style={style}>
        <Card raised className={card.Card} >
          <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
            {this.props.search.tweets.slice(0, 10).map((t, i) => {
              return <Tweet key={`t${i}`} data={t} />
            })}
          </CardContent>
          <CardActions className={card.CardActions}>
            <h2 className={insightsStyle.CardLink}>
              <Link to={`/search/${this.props.searchId}/tweets/`}>
                View {parseInt(this.props.search.tweetCount, 10).toLocaleString()} Tweets &rarr;
              </Link>
            </h2>
          </CardActions>
        </Card>

        <Card raised className={card.Card} >
          <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
            <UserList
              addSearchTerm={() => null}
              users={this.props.search.users.slice(0, 50)}/>
          </CardContent>

          <CardActions className={card.CardActions}>
            <h2 className={insightsStyle.CardLink}>
              <Link to={`/search/${this.props.searchId}/users/`}>View {parseInt(this.props.search.userCount, 10).toLocaleString()} Users &rarr;</Link>
            </h2>
          </CardActions>
        </Card>

        <Card raised className={card.Card} >
          <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
            <HashtagChart
              readOnly={true}
              addSearchTerm={() => null}
              hashtags={this.props.search.hashtags}
              query={this.props.search.query} />
          </CardContent>

          <CardActions className={card.CardActions}>
            <h2 className={card.PlaceHeader}>Hashtags</h2>
          </CardActions>
        </Card>

        {webpageCard}
        {imageCard}
        {videoCard}
      </div>
    )
  }
}

InsightsBody.propTypes = {
  searchId: PropTypes.number,
  search: PropTypes.object,
  webpages: PropTypes.array,
}
