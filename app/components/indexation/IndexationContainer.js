// @flow
import React, { Component } from 'react';
import Loader from 'react-loader';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import IndexationView from './IndexationView';
import * as IndexationActions from '../../modules/indexation/indexationAction';
import { doScan, FileProps } from '../../api/filesystem';
import { findDb, updateDb, insertDb } from '../../api/database';

type Props = {
  loadDatabase: string => void,
  indexProgress: (string, number) => void,
  startIndexation: () => void,
  endIndexation: () => void,
  indexDuplicate: (string, Map<string, Array<string | number | Date>>) => void,
  masterFolder: string,
  dbLoaded: boolean,
  dbSize: number
};

class IndexationContainer extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.processFile = this.processFile.bind(this);

    this.props.loadDatabase(this.props.masterFolder);
  }

  async processFile(fileProps: FileProps) {
    const occurences = await findDb(this.props.masterFolder, { relpath: fileProps.relpath });
    if (occurences.length) {
      if (occurences.length > 1) {
        console.error(`More than 1 occurence for relpath ${fileProps.relpath}!! This should never happen! Will only compare to the first one...`);
        console.error(occurences);
      }

      // File already indexed... Check that the file is correct in db or update it...
      const diff = fileProps.compareToSamePath(occurences[0]);
      if (diff) {
        this.props.indexDuplicate(occurences[0], fileProps, diff);
        await updateDb(this.props.masterFolder, occurences[0].cloneFromSamePath(fileProps));
      }
    } else {
      await insertDb(this.props.masterFolder, fileProps);
    }
  }

  async index() {
    this.props.startIndexation();
    await doScan(this.props.masterFolder, this.processFile, this.props.indexProgress);

    this.props.loadDatabase(this.props.masterFolder);

    this.props.endIndexation();
  }

  render() {
    return (
      <Loader loaded={this.props.dbLoaded}>
        <IndexationView index={this.index.bind(this)} dbSize={this.props.dbSize} />
      </Loader>
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.foldersState.masterPath,
    dbLoaded: state.indexationState.dbLoaded,
    dbSize: state.indexationState.dbSize
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(IndexationActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexationContainer);
