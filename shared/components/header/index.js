import { connect } from 'react-redux';
import React, { Component } from 'react';

import styles from './styles';

class Header extends Component {
  render() {
    return (
      <div className={styles.container}>
        <p className={styles.title}>This is the header</p>
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
)(Header);
