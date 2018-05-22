/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/App';
import HomeContainer from './components/home/HomeContainer';
import LayoutContainer from './components/LayoutContainer';

export default () => (
  <App>
    <Switch>
      <Route exact path="/" component={HomeContainer} />
      <Route path="/" component={LayoutContainer} />
    </Switch>
  </App>
);
