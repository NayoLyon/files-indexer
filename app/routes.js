/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/App';
import HomeContainer from './components/HomeContainer';
import IndexationContainer from './components/IndexationContainer';
import ScanContainer from './components/ScanContainer';

export default () => (
  <App>
    <Switch>
      <Route exact path="/scan" component={ScanContainer} />
      <Route exact path="/index" component={IndexationContainer} />
      <Route path="/" component={HomeContainer} />
    </Switch>
  </App>
);
