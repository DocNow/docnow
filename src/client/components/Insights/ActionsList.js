import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Tweet from '../Explore/Tweet'

export default class ActionsList extends Component {

  render() {
    const consent = this.props.actions.filter(a => a.archived === null && a.tweet)
    return (
      <section>
        <div>
          {consent.map(action => (
            <div key={`action-${action.id}`}>
              <Tweet data={action.tweet.json} action={action} />
            </div>
          ))}
        </div>
      </section>
    )
  }

}

ActionsList.propTypes = {
  actions: PropTypes.array
}

