import { SET_TWITTER_SEARCH_TWEETS } from '../actions/search'

const initialState = []

export default function randomTweets(state = initialState, action) {

  switch (action.type) {

    case SET_TWITTER_SEARCH_TWEETS: {
      return action.tweets.sort(() => Math.random() - 0.5)
    }

    default: {
      return state
    }

  }

}
