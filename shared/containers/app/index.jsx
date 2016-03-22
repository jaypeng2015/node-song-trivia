import { connect } from 'react-redux';
import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <div>
        <p>This is the app</p>
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
