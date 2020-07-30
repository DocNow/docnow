import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createArchive } from '../actions/search'

import DownloadOptions from '../components/Insights/DownloadOptions'

const mapStateToProps = (state, ownProps) => {
  const data = {
    searchId: state.search.id,
    active: state.search.active,
    archived: state.search.archived,
    archiveStarted: state.search.archiveStarted
  }
  if (ownProps) {
    data.searchId = ownProps.id
    data.active = ownProps.active
    data.archived = ownProps.archived
    data.archiveStarted = ownProps.archiveStarted
  }
  return data
}

const actions = {
  createArchive,
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(DownloadOptions)
