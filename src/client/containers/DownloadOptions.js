import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createArchive } from '../actions/search'

import DownloadOptions from '../components/Insights/DownloadOptions'

const mapStateToProps = (state) => {
  return {
    searchId: state.search.id,
    active: state.search.active,
    archived: state.search.archived,
    archiveStarted: state.search.archiveStarted
  }
}

const actions = {
  createArchive,
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(DownloadOptions)
