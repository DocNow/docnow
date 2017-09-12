import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SearchSummary from '../components/SearchSummary'
import { getSearchSummary } from '../actions/search'

const mapStateToProps = (state) => {
  return {
    minDate: state.search.searchInfo.minDate,
    maxDate: state.search.searchInfo.maxDate,
    count: state.search.searchInfo.count,
    endpoint: state.search.searchInfo.url
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({getSearchSummary}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SearchSummary)
