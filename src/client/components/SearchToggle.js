import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Message from './Message'
import ReactModal from 'react-modal'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'
import CloseModal from './Insights/CloseModal'
import { ServerStyleSheets } from '@material-ui/styles'
import style from './SearchToggle.css'

export default class SearchToggle extends Component {

  constructor(props) {
    super(props)
    this.resetError = this.resetError.bind(this)
    this.state = {
      error: null,
      modalOpen: false
    }
  }

  setModalOpen(val) {
    this.setState({
      modalOpen: val
    })
  }

  toggle(e) {
    const totalTweets = this.props.searches.reduce((n, search) => n + search.tweetCount, 0) 
    if (! this.props.user.active) {
      this.setState({error: 'Your account is not active, please email the admin.'})
    } else if (totalTweets > this.props.user.tweetQuota) {
      this.setState({error: 
        `You are over your quota of ${this.props.user.tweetQuota} tweets.
        Delete one or more collections to start collecting again.`
      })
    } else if (!this.props.active && this.props.searches.filter(s => s.active).length === 2) {
      this.setState({error: 
        `You cannot have more than 2 active searches.`
      })
    } else {
      this.props.updateSearch({
        id: this.props.id,
        active: e.target.checked,
        archived: false
      })
    }
  }

  resetError() {
    this.setState({error: null})
  }

  start() {
    this.setState({error: 'started!'})
  }

  render() {
    const title = this.props.active ? 'Stop Data Collection' : 'Start Data Collection'
    const color = this.props.active ? 'primary' : 'secondary'
    const msg = this.state.error ? <Message type="error" text={this.state.error} onClose={this.resetError} /> : ''

    const modalStyle = {
      content: {
        padding: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 600,
      }
    }

    // get a text representation of the search
    const host = window.location.host
    const query = this.props.query.value.or.map(v => v.value).join(' ')
    const tweetText = this.props.instanceTweetText
      .replace('{query}', `"${query}"`)
      .replace('{collection-url}', `https://${host}/${this.props.id}`)

    return (
      <>
        <Switch className={ServerStyleSheets.Admin}
          checked={this.props.active}
          color={color}
          title={title}
          onChange={() => {this.setModalOpen(! this.state.modalOpen)}} />

        {msg}

        <ReactModal isOpen={this.state.modalOpen} style={modalStyle}>
          <CloseModal title="Activate Your Search" close={() => this.setModalOpen(false)} style={{width: 590}} />
          <div className={style.SearchToggle}>

            <section>
              Activating your search makes it available as a public <em>Collection</em> so 
              that users can consent to having their tweets archived. In order to do this 
              you will need to supply a description of your collection, and indicate how 
              you would like to announce it on Twitter. 
            </section>

            <section>
              <TextField 
                required={true}
                variant="outlined"
                id="title"
                name="title"
                lable="Collection Title"
                helperText="A short title for your collection."
                value={this.props.title} 
                onChange={this.props.updateSearch} 
                fullWidth={true} />
            </section>

            <section>
              <TextField
                required={true}
                variant="outlined"
                id="description"
                name="description"
                label="Collection Description"
                multiline={true}
                rows={5}
                autofocus={true}
                helperText="A description of your search to help others understand why you are creating the collection."
                placeholder="For example: This collection is being created to document this significant event in our community. Data will be stored in our community center."
                value={this.props.description}
                onChange={this.props.updateSearch} />
            </section>

            <section>
              <TextField
                required={this.props.user.admin}
                variant="outlined"
                id="tweet"
                name="tweet"
                label="Tweet Text"
                multiline={true}
                rows={5}
                autofocus={true}
                helperText="Starting tweet collection will cause a tweet to be sent on your behalf letting users know about your collection."
                value={tweetText}
                onChange={this.props.updateSearch} />
            </section>

            <section>
              <Button 
                onClick={() => this.start()}
                variant="contained" 
                color="primary">Start</Button>
            </section>

          </div>
        </ReactModal>
      </>
    )
  }

}

SearchToggle.propTypes = {
  id: PropTypes.number,
  updateSearch: PropTypes.func,
  active: PropTypes.bool,
  user: PropTypes.object,
  title: PropTypes.string,
  description: PropTypes.string,
  query: PropTypes.object,
  instanceTweetText: PropTypes.string,
  searches: PropTypes.array,
}
