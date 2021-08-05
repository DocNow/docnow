import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Message from './Message'
import Modal from 'react-modal'
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

    const host = window.location.host
    const lastQuery = this.props.search.queries[this.props.search.queries.length - 1]
    const queryText = lastQuery.value.or.map(v => v.value).join(' ')
    const tweetText = this.props.instanceTweetText
      .replace('{query}', `"${queryText}"`)
      .replace('{collection-url}', `https://${host}/${this.props.search.id}`)

    this.state = {
      error: null,
      modalOpen: false,
      active: this.props.search.active,
      title: this.props.search.title,
      description: this.props.search.description,
      descriptionError: false,
      tweetText: tweetText,
      tweetTextError: false,
    }
  }

  resetError() {
    this.setState({error: null})
  }

  start() {

    let error = false
    if (! this.state.description) {
      error = true
      this.setState({descriptionError: true})
    }

    if (! this.state.tweetText) {
      error = true
      this.setState({tweetTextError: true})
    }

    if (error) {
      return
    }

    this.props.updateSearch({
      id: this.props.search.id,
      description: this.state.description,
      tweetText: this.state.tweetText,
      active: true,
      archived: false,
    })

    this.setState({
      modalOpen: false,
      active: true
    })
  }

  stop() {
    this.props.updateSearch({
      id: this.props.search.id,
      active: false,
      archived: false
    })
    this.setState({
      active: false
    })
  }

  render() {
    const app = document.getElementById('App')
    const title = this.state.active ? 'Stop Data Collection' : 'Start Data Collection'
    const color = this.state.active ? 'primary' : 'secondary'
    const msg = this.state.error ? <Message type="error" text={this.state.error} onClose={this.resetError} /> : ''

    const modalStyle = {
      content: {
        padding: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 600,
      }
    }

    return (
      <>

        <Switch className={ServerStyleSheets.Admin}
          checked={this.state.active}
          color={color}
          title={title}
          onChange={() => {
            if (this.state.active) {
              this.stop()
            } else {
              this.setState({
                descriptionError: false,
                tweetTextError: false,
                modalOpen: true
              })
            }
          }} />

        {msg}

        <Modal 
          onClose={() => this.setState({modalOpen: false})} 
          isOpen={this.state.modalOpen} 
          style={modalStyle} 
          appElement={app}>

          <CloseModal title="Activate Your Search" close={() => this.setState({modalOpen: false})} style={{width: 590}} />
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
                value={this.state.title} 
                onChange={e => this.setState({title: e.target.value})}
                fullWidth={true} />
            </section>

            <section>
              <TextField
                error={this.state.descriptionError}
                required={true}
                variant="outlined"
                id="description"
                name="description"
                label="Collection Description"
                multiline={true}
                rows={5}
                helperText="A description of your search to help others understand why you are creating the collection."
                placeholder="For example: This collection is being created to document this significant event in our community. Data will be stored in our community center."
                value={this.state.description || ''} 
                onChange={e => this.setState({description: e.target.value})} />
            </section>

            <section>
              <TextField
                error={this.state.tweetTextError}
                required={this.props.user.admin}
                variant="outlined"
                id="tweet"
                name="tweet"
                label="Tweet Text"
                multiline={true}
                rows={5}
                helperText="Starting tweet collection will cause a tweet to be sent on your behalf letting users know about your collection."
                value={this.state.tweetText} 
                onChange={e => this.setState({tweetText: e.target.value})} />
            </section>

            <section>
              <Button 
                onClick={() => this.start()}
                variant="contained" 
                color="primary">Start</Button>
            </section>

          </div>

        </Modal>
      </>
    )
  }

}

SearchToggle.propTypes = {
  search: PropTypes.object,
  user: PropTypes.object,
  updateSearch: PropTypes.func,
  instanceTweetText: PropTypes.string,
}
