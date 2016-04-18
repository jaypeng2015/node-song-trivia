import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

import Header from 'components/header';
import Footer from 'components/footer';
import Sidebar from 'components/sidebar';

import styles from './styles';

class App extends Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
  };

  render() {
    return (
      <div>
        <Header />
        <Sidebar className={styles.rightSidebar} />
        <div>
          {this.props.children}
        </div>
        <Footer />
      </div>
      );
  }
}

const mapStateToProps = (state) => ({
  ...state,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {},
  dispatch,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
