import { Component } from 'react'
import { withRouter } from "react-router"
import PropTypes from 'prop-types'

class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children;
  }
}

ScrollToTop.propTypes = {
  children: PropTypes.children,
  location: PropTypes.location,
}

export default withRouter(ScrollToTop);