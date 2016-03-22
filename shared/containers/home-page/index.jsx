
import { connect } from 'react-redux';
import React, { Component } from 'react';


class HomePage extends Component {
  render() {
    return (
      <div>
        <p>This is the home page</p>
      </div>
      );
  }
}

const mapStateToProps = (state) => ({
  ...state
});

const mapDispatchToProps = (dispatch) => ({
  actions: {},
  dispatch,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePage);
