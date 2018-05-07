// @flow
import React, { Component } from 'react';
import Loader from 'react-loader';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Indexation from './Indexation';
import * as IndexationActions from '../modules/indexation/indexationAction';

type Props = {
  loadDatabase: (string) => void,
  masterFolder: string,
  dbLoaded: boolean,
  dbSize: number
};

class IndexationPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.props.loadDatabase(this.props.masterFolder);
  }

  startIndexation() {
    // TODO implement...
    console.log('TODO implement this...', this);
  }

  render() {
    return (
      <Loader loaded={this.props.dbLoaded}>
        <Indexation
          startIndexation={this.startIndexation.bind(this)}
          masterFolder={this.props.masterFolder}
          dbSize={this.props.dbSize}
        />
      </Loader>
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.folders.masterPath,
    dbLoaded: state.indexation.dbLoaded,
    dbSize: state.indexation.dbSize
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(IndexationActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexationPage);
