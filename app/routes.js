/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/App';
import HomePage from './components/HomePage';
import IndexationPage from './components/IndexationPage';
import ScanPage from './components/ScanPage';

export default () => (
  <App>
    <Switch>
      <Route exact path="/scan" component={ScanPage} />
      <Route exact path="/index" component={IndexationPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
