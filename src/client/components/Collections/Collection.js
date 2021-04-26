// import moment from 'moment'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import TweetEmbed from 'react-tweet-embed'
import FindMe from './FindMe'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Checkbox from '@material-ui/core/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'

import listStyle from './CollectionList.css'
import style from './Collection.css'
import card from '../Card.css'

export default class CollectionList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checkedTweets: [],
      findUser: '',
      findingUser: false,
      lastUserLookup: ''
    }
    this.randomTweet = Math.floor(Math.random() * (98))
  }

  componentDidMount() {
    this.tick()
    this.props.getTweets(this.props.searchId)
    this.props.getUsers(this.props.searchId)
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    this.props.getSearch(this.props.searchId)
    this.props.getFoundInSearches()

    const foundTweets = this.props.user.foundInSearches[this.props.searchId] || []
    if (this.state.checkedTweets.length === 0 && foundTweets.length > 0) {
      this.setState({
        checkedTweets: foundTweets.map(() => false)
      })
    }
  }

  handleFindUserInput(user) {
    const findingUser = user === '' ? false : this.state.findingUser
    this.setState({
      findUser: user,
      findingUser
    })
  }

  findUser() {
    if (this.state.findUser !== '') {
      this.setState({
        findingUser: true,
        lastUserLookup: this.state.findUser
      })
      this.props.getTweetsForUser(this.props.searchId, this.state.findUser)
    }
  }

  setAllTweets(checked) {    
    this.setState({
      checkedTweets: this.state.checkedTweets.map(() => checked)
    })
  }

  toggleOneTweet(i) {
    this.setState({
      checkedTweets: this.state.checkedTweets.map((v, tIdx) => {return (i === tIdx ? !v : v)})
    })
  }

  render() {
    // don't render until we at least know the title of the collection
    if (!this.props.search.title) {
      return <div/>
    }

    const tweetCount = this.props.search.tweetCount.toLocaleString()

    const contact = this.props.search.creator.email
      ? <a href={`mailto:${this.props.search.creator.email}`}>{this.props.search.creator.email}</a>
      : 'No contact provided.'
    let tweets = 'Loading tweets...'
    if (this.props.search.tweets.length > 0) {      
      tweets = this.props.search.tweets.slice(this.randomTweet, this.randomTweet + 2).map((t, i) => {
        return <TweetEmbed key={`t${i}`} id={t.id} />
      })
    }

    let userTweets = (<div className={style.CardInnerContent}>
      <Typography variant="body1">Authenticate to Twitter to find out if any of your tweets are
      in this collection.</Typography>
      <Typography variant="body1">When you authenticate, you can specify consent, request removal,
      or start a conversation with the collector about your content.</Typography>
    </div>)

    if (this.props.user) {
      const foundTweets = this.props.user.foundInSearches[this.props.searchId] || []
      if (foundTweets.length > 0) {
        userTweets = (<>
          <FormControl component="fieldset" className={style.CardInnerContent}>
            <FormGroup row>
              <FormControlLabel
                value="all"
                control={<Checkbox color="primary" 
                  onChange={t => this.setAllTweets(t.target.checked)} 
                  checked={this.state.checkedTweets.indexOf(false) === -1} />}
                label={`Select all ${foundTweets.length} tweets`}
              />
            </FormGroup>
          </FormControl>
          <Button size="small"><span className={style.ButtonText}>Specify/Adjust Consent</span></Button>
          <hr/>
          {foundTweets.map((tweetId, i) => {
            return (
              <Grid container spacing={0} key={`ut${i}`}>
                <Grid item xs={2}><Checkbox color="primary" checked={this.state.checkedTweets[i] || false} onChange={() => this.toggleOneTweet(i)} /></Grid>
                <Grid item xs={10}><TweetEmbed id={tweetId} /></Grid>
              </Grid>
            )            
          })}
        </>)
      } else {
        userTweets = <Typography variant="body1">There are no tweets by you in this collection.</Typography>
      }
    }

    let usersInfo = (<div>
      <Typography variant="body2">Showing {this.props.search.users.length} of {this.props.search.userCount} users.</Typography>
      {this.props.search.users.map((u, i) => {
        return <img className={style.UserImg}
          src={u.avatarUrl}
          alt={u.screenName}
          title={u.screenName} key={`u${i}`} />
      })}      
    </div>)

    if (this.state.findingUser) {
      if (this.props.foundUserTweets > 0) {
        usersInfo = (
          <Typography variant="body2">
            Found {this.props.foundUserTweets} tweet{this.props.foundUserTweets > 1 ? 's' : ''} by &nbsp;
            <a href={`https://twitter.com/${this.state.lastUserLookup}`}>@{this.state.lastUserLookup}</a>.
          </Typography>)
      } else {
        usersInfo = <Typography variant="body2">Could not find user &quot;{this.state.lastUserLookup}&quot;.</Typography>
      }
    }    

    return (
      <>
        <Grid container spacing={3} className={listStyle.Header}>
          <Grid item xs={12} className={listStyle.Title}>
            <Typography variant="h2">
              <Link to="/collections">ALL COLLECTIONS</Link> ➔ {this.props.search.title.toUpperCase()}
            </Typography>            
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              { this.props.search.description || 'No description provided for this collection.' }
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body1">
              Collected by: <strong><a href={`https://twitter.com/${this.props.search.creator.twitterScreenName}`}>
                @{this.props.search.creator.twitterScreenName}</a></strong>
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body1">
              Contact: <strong>{contact}</strong>
            </Typography>
          </Grid>
        </Grid>

        <div className={`${card.CardHolder} ${style.CardHolder}`}>
          <Card raised className={`${card.Card} ${style.Card}`} >
            <CardContent>
              <div className={style.CardTitle}>
                <FindMe user={this.props.user} dest={`/collection/${this.props.searchId}`}/>                
              </div>
              {userTweets}
            </CardContent>
          </Card>
          <Card raised className={`${card.Card} ${style.Card}`} >
            <CardContent>
              <div className={style.CardTitle}>
                <Paper id="box" elevation={4} className={style.Search}>
                  <TextField name="usersearch" className={style.SearchInput} 
                    onChange={(e) => this.handleFindUserInput(e.target.value)} />
                  <IconButton color="primary" onClick={() => this.findUser()}>
                    <ion-icon name="search"></ion-icon>
                  </IconButton>
                </Paper>
              </div>
              {usersInfo}
            </CardContent>
          </Card>
          <Card raised className={`${card.Card} ${style.Card}`} >
            <CardContent>
              <Typography variant="h2" className={style.CardTitle}>
                {tweetCount} tweets (all users)
              </Typography>
              <Typography variant="body2">Showing 2 random tweets from the collection.</Typography>
              {tweets}
            </CardContent>
          </Card>
        </div>
      </>
    )
  }
}

CollectionList.propTypes = {
  user: PropTypes.object,
  searchId: PropTypes.string,
  search: PropTypes.object,
  getSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getUsers: PropTypes.func,
  getFoundInSearches: PropTypes.func,
  getTweetsForUser: PropTypes.func,
  foundUserTweets: PropTypes.bool
}
