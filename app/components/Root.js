// @flow
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Switch, Route } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';

import HomeContainer from './home/HomeContainer';
import LayoutContainer from './LayoutContainer';

type Props = {
  store: {},
  history: {}
};

export default class Root extends Component<Props> {
  render() {
    return (
      <Provider store={this.props.store}>
        <ConnectedRouter history={this.props.history}>
          <Switch>
            <Route exact path="/" component={HomeContainer} />
            <Route path="/" component={LayoutContainer} />
          </Switch>
        </ConnectedRouter>
      </Provider>
    );
  }
}
