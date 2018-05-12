// @flow
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ScanResult from './ScanResult';
import * as ScanActions from '../modules/scan/scanAction';

type Props = {
};

class ScanResultPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <ScanResult />
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ScanActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanResultPage);
