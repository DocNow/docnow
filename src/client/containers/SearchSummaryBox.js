import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SearchSummary from '../components/SearchSummary'
import { getSearch } from '../actions/search'

const mapStateToProps = (state) => {
  return {
    id: state.search.id,
    count: state.search.count,
    minDate: state.search.minDate,
    maxDate: state.search.maxDate,
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({getSearch}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SearchSummary)
