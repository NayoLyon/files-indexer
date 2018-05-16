/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/App';
import HomeContainer from './components/home/HomeContainer';
import IndexationContainer from './components/indexation/IndexationContainer';
import ScanContainer from './components/scan/ScanContainer';

export default () => (
  <App>
    <Switch>
      <Route exact path="/scan" component={ScanContainer} />
      <Route exact path="/index" component={IndexationContainer} />
      <Route path="/" component={HomeContainer} />
    </Switch>
  </App>
);
