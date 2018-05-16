/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/App';
import HomeContainer from './components/HomeContainer';
import IndexationPage from './components/IndexationPage';
import ScanPage from './components/ScanPage';

export default () => (
  <App>
    <Switch>
      <Route exact path="/scan" component={ScanPage} />
      <Route exact path="/index" component={IndexationPage} />
      <Route path="/" component={HomeContainer} />
    </Switch>
  </App>
);
