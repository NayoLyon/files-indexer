// @flow
/* eslint no-await-in-loop: "off" */
import React, { Component } from 'react';
import Loader from 'react-loader';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import fs from 'fs';
import path from 'path';
import Indexation from './Indexation';
import * as IndexationActions from '../modules/indexation/indexationAction';
import { walkDir, computeHash } from '../api/filesystem';
import { findDb, insertDb } from '../api/database';

type Props = {
  loadDatabase: string => void,
  indexProgress: (string, number) => void,
  startIndexation: () => void,
  endIndexation: () => void,
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

  async index() {
    const folder = this.props.masterFolder;
    this.props.startIndexation();

    this.props.indexProgress('LISTING', 0);
    const files = await walkDir(folder, 0, 100, this.props.indexProgress);

    // Now scanning files to store in DB
    for (let i = 0; i < files.length; i += 1) {
      this.props.indexProgress('INDEXING', Math.round((i * 100) / files.length));
      const file = files[i];

      const hash = await computeHash(file);
      const stats = fs.statSync(file);

      const fileProps = {
        _id: hash,
        name: path.basename(file),
        ext: path.extname(file),
        folder: path.dirname(file),
        path: file,
        size: stats.size,
        modified: stats.mtime,
        changed: stats.ctime,
        created: stats.birthtime
      };
      const occurences = await findDb(folder, { _id: hash });
      if (occurences === null || occurences.length === 0) {
        await insertDb(folder, fileProps);
      } else {
        // TODO compare with current file...
      }
    }

    this.props.loadDatabase(this.props.masterFolder);

    this.props.endIndexation();
  }

  render() {
    return (
      <Loader loaded={this.props.dbLoaded}>
        <Indexation index={this.index.bind(this)} dbSize={this.props.dbSize} />
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
