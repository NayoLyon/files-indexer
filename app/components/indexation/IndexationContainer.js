// @flow
import React, { Component } from 'react';
import Loader from 'react-loader';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import IndexationView from './IndexationView';
import * as IndexationActions from '../../modules/indexation/indexationAction';
import { doScan, FileProps, FilePropsDb } from '../../api/filesystem';
import { findDb, updateDb, insertDb } from '../../api/database';

type Props = {
  createDatabase: string => void,
  loadDatabase: string => void,
  indexProgress: (string, number) => void,
  startIndexation: () => void,
  endIndexation: () => void,
  indexDuplicate: (FilePropsDb | void, FileProps, Set<string>) => void,
  masterFolder: string,
  dbLoaded: boolean,
  dbSize: number
};

class IndexationContainer extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.processFileWithHash = this.processFileWithHash.bind(this);
    this.startIndex = this.startIndex.bind(this);

    this.props.createDatabase(this.props.masterFolder);
  }

  // This method returns a function to process a file scanned on the disk.
  // This method returns either the function to process a file with its hash already computed,
  // or the function to process a file with its hash NOT YET computed.
  processFileWithHash(hashComputed: boolean = true) {
    return async (fileProps: FileProps) => {
      const occurences = await findDb(this.props.masterFolder, { relpath: fileProps.relpath });
      if (occurences.length) {
        if (occurences.length > 1) {
          console.error(
            `More than 1 occurence for relpath ${
              fileProps.relpath
            }!! This should never happen! Will only compare to the first one...`
          );
          console.error(occurences);
        }

        // File already indexed... Check that the file is correct in db or update it...
        let diff = fileProps.compareToSamePath(occurences[0]);
        if (!hashComputed) {
          diff.delete('hash');
        }
        if (diff.size) {
          if (!hashComputed) {
            // There are differences between the files... Recompute the hash and relaunch compare to include the hash
            await fileProps.computeHash();
            diff = fileProps.compareToSamePath(occurences[0]);
          }

          // Then update the db and log
          this.props.indexDuplicate(occurences[0], fileProps, diff);
          await updateDb(this.props.masterFolder, occurences[0].cloneFromSamePath(fileProps));
        }
      } else {
        if (!hashComputed) {
          await fileProps.computeHash();
          console.info('Adding new file in db', fileProps);
          this.props.indexDuplicate(undefined, fileProps, new Set(['new']));
        }
        await insertDb(this.props.masterFolder, new FilePropsDb(fileProps));
      }
    };
  }
  // This method returns the function to index the db folder.
  // This method returns either the function to perform a full re-indexation (hash computed, withHash=true)
  // or the function to perform a quick re-indexation (no hash computed unless file is modified or new, withHash=false)
  startIndex(withHash: boolean = true) {
    return async () => {
      this.props.startIndexation();
      await doScan(
        this.props.masterFolder,
        this.processFileWithHash(withHash),
        this.props.indexProgress,
        withHash
      );

      this.props.loadDatabase(this.props.masterFolder);

      this.props.endIndexation();
    };
  }

  render() {
    return (
      <Loader loaded={this.props.dbLoaded}>
        <IndexationView
          index={this.startIndex(true)}
          quickIndex={this.startIndex(false)}
          dbSize={this.props.dbSize}
        />
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
