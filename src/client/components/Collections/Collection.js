import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import FindMe from './FindMe'
import Tweet from '../Explore/Tweet'
import ConsentModal from './ConsentModal'
import { ImageLabel } from '../Label'
import Intro from '../Intro'

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
import noAvatar from '../../images/no-avatar.png'

export default class CollectionList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedTweets: [],
      allSelected: false,
      findUser: '',
      findingUser: false,
      lastUserLookup: ''
    }
  }

  componentDidMount() {
    this.props.getTweets(this.props.searchId)
    this.props.getUsers(this.props.searchId)
    this.props.getSearch(this.props.searchId)
    this.props.getUserTweetsInSearch(this.props.searchId)
  }

  componentWillUnmount() {
    this.props.resetTwitterSearch()
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
    if (checked) {
      this.setState({
        allSelected: true,
        selectedTweets: Array.from(this.props.user.tweets)
      })
    } else {
      this.setState({
        allSelected: false,
        selectedTweetIds: []
      })
    }
  }

  toggleOneTweet(tweet) {
    const selected = this.state.selectedTweets
    const pos = selected.findIndex(t => t.id == tweet.id)
    if (pos === -1) {
      selected.push(tweet)
    } else {
      selected.splice(pos, 1)
    }
    this.setState({
      selectedTweets: selected,
      allSelected: false
    })
  }

  openModal() {
    this.setState({
      modalOpen: true
    })
  }

  closeModal() {
    this.setState({
      modalOpen: false
    })
  }

  fixMissingAvatar(event) {
    event.target.src = noAvatar;
  }

  render() {
    // don't render until we at least know the title of the collection
    if (!this.props.search.title) {
      return <div/>
    }

    const tweetCount = this.props.search.tweetCount.toLocaleString()

    let userTweets = (<div className={style.CardInnerContent}>
      <Typography variant="body1">
        <p>Authenticate with Twitter to find out if any of your tweets are in this collection.</p>
        <p>When you authenticate, you can specify consent, request removal, or start a conversation with the collector about your content.</p>
      </Typography>
    </div>)

    // if the user is logged into DocNow we can see if we have their tweets
    if (this.props.user && this.props.user.twitterScreenName) {
      if (this.props.user.tweets && this.props.user.tweets.length > 0) {
        const userTweetsContent = this.props.user.tweets || []
        const consentDisabled = this.state.selectedTweets.length == 0

        userTweets = (<>
          <FormControl component="fieldset" className={style.CardInnerContent}>
            <FormGroup row>
              <FormControlLabel
                value="all"
                control={
                  <Checkbox color="primary"
                    onChange={t => this.setAllTweets(t.target.checked)}
                    checked={this.state.allSelected} />}
                    label={`Select all ${this.props.user.tweets.length} tweets`} />
            </FormGroup>
          </FormControl>
          <Button
            disabled={consentDisabled}
            variant="contained"
            onClick={() => this.openModal()}>
            Specify Consent
          </Button>
          <hr/>
          {userTweetsContent.map((tweet, i) => {
            const selected = this.state.selectedTweets.findIndex(t => t.id == tweet.id) !== -1
            return (
              <Grid container spacing={0} key={`ut${i}`}>
                <Grid item xs={2} className={style.ConsentTweet}>
                  <Checkbox
                    color="primary"
                    checked={selected}
                    onChange={() => this.toggleOneTweet(tweet)} />
                  <br />
                  {tweet.consentActions.map(action => (
                     <ImageLabel key={`action-${tweet.id}-${action.id}`} name={action.name} />
                  ))}
                </Grid>
                <Grid item xs={10}>
                  <Tweet data={tweet} />
                </Grid>
              </Grid>
            )
          })}
        </>)
      } else {
        userTweets = <Typography variant="h2">There are no tweets by you in this collection</Typography>
      }
    }

    let usersInfo = (<div>

      {this.props.search.users.map((u, i) => {
        return (
          <a
            href={`https://twitter.com/${u.screenName}`}
            key={`user-${i}`}
            rel="noreferrer"
            target="_blank">
            <img
              className={style.UserImg}
              src={u.avatarUrl}
              alt={u.screenName}
              onError={this.fixMissingAvatar}
              title={u.screenName} />
          </a>
        )
      })}
    </div>)

    if (this.state.findingUser) {
      if (this.props.foundUserTweets.length > 0) {
        usersInfo = (
          <Typography variant="body2">
            Found {this.props.foundUserTweets.length} tweet{this.props.foundUserTweets.length > 1 ? 's' : ''} by &nbsp;
            <a href={`https://twitter.com/${this.state.lastUserLookup}`}>@{this.state.lastUserLookup}</a>.
          </Typography>)
      } else {
        usersInfo = <Typography variant="body2">Could not find user &quot;{this.state.lastUserLookup}&quot;.</Typography>
      }
    }

    return (
      <>
        <ConsentModal
          isOpen={this.state.modalOpen}
          close={() => this.closeModal()}
          searchId={this.props.searchId}
          selectedTweets={this.state.selectedTweets}
          setConsentActions={this.props.setConsentActions}
          revokeConsent={this.props.revokeConsent} />

        <Grid container spacing={3} className={listStyle.Header}>
          <Grid item xs={12} className={listStyle.Title}>
            <Typography variant="h2">
              <Link to="/collections">ALL COLLECTIONS</Link> ➔ {this.props.search.title.toUpperCase()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Intro>
              Description: { this.props.search.description || 'No description provided for this collection.' } <br/> <strong>{tweetCount}</strong> tweets | collected by <strong><a href={`https://twitter.com/${this.props.search.creator.twitterScreenName}`}>
                  @{this.props.search.creator.twitterScreenName}</a></strong>

            </Intro>
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
              <Typography variant="h2"><center>Showing {this.props.search.users.length} of {this.props.search.userCount.toLocaleString()} users</center></Typography><br />
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
                10 random tweets from collection
              </Typography>
                            <hr />
              { this.props.randomTweets.slice(0, 10).map((t, i) => (
                <Tweet key={`t${i}`} data={t} />
              ))}
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
  foundUserTweets: PropTypes.array,
  getSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getUsers: PropTypes.func,
  getFoundInSearches: PropTypes.func,
  getTweetsForUser: PropTypes.func,
  getUserTweetsInSearch: PropTypes.func,
  setConsentActions: PropTypes.func,
  revokeConsent: PropTypes.func,
  resetTwitterSearch: PropTypes.func,
  randomTweets: PropTypes.array
}
