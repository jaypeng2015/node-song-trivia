import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import React, { Component, PropTypes } from 'react';

function scrollToTop() {
  window.scrollTo(0, 0);
}

export default class Root extends Component {
  static propTypes = {
    routes: PropTypes.element.isRequired,
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  render() {
    const { routes, store, history } = this.props;

    return (
      <Provider store={store}>
        <Router history={history} onUpdate={scrollToTop} routes={routes} />
      </Provider>
      );
  }
}
