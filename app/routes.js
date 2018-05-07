/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/App';
import HomePage from './components/HomePage';
import IndexationPage from './components/IndexationPage';

export default () => (
  <App>
    <Switch>
      <Route path="/index" component={IndexationPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
