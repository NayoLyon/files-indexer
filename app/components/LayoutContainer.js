/* eslint flowtype-errors/show-errors: 0 */
import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { connect } from 'react-redux';

import HomeContainer from './home/HomeContainer';
import IndexationContainer from './indexation/IndexationContainer';
import ScanContainer from './scan/ScanContainer';
import AnalyseContainer from './analyseDb/AnalyseContainer';

type Props = {
  dbLoaded: boolean
};

class LayoutContainer extends Component<Props> {
  props: Props;
  render() {
    if (!this.props.dbLoaded) {
      return <IndexationContainer />;
    }
    return (
      <Switch>
        <Route exact path="/scan" component={ScanContainer} />
        <Route exact path="/index" component={IndexationContainer} />
        <Route exact path="/analyseDb" component={AnalyseContainer} />
        <Route path="/" component={HomeContainer} />
      </Switch>
    );
  }
}

function mapStateToProps(state) {
  return {
    dbLoaded: state.indexationState.dbLoaded
  };
}

export default connect(mapStateToProps)(LayoutContainer);
