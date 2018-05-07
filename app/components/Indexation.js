// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from './Home.css';

type Props = {
  index: () => void,
  masterFolder: string,
  dbSize: number,
  indexing: boolean,
  isIndexed: boolean,
  step: string,
  progress: number
};

class Indexation extends Component<Props> {
  props: Props;

  render() {
    let content = null;
    if (!this.props.isIndexed && !this.props.indexing) {
      content = <button onClick={this.props.index}>Start Indexation</button>;
    } else if (this.props.indexing) {
      content = (
        <div>
          <h2>{this.props.step} at {this.props.progress}%</h2>
        </div>
      );
    } else if (this.props.isIndexed) {
      // TODO displaying database content...
      content = (
        <div>
          <h2>Folder indexed...</h2>
          <p>{this.props.dbSize} elements indexed.</p>
          <Link to="/scan">Now scan folder</Link>
        </div>
      );
    }
    return (
      <div>
        <div className={styles.backButton} data-tid="backButton">
          <Link to="/">
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <div>
          <h1>Indexation of folder {this.props.masterFolder}</h1>
        </div>
        <div>
          {content}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.folders.masterPath,
    dbSize: state.indexation.dbSize,
    indexing: state.indexation.indexing,
    isIndexed: state.indexation.isIndexed,
    step: state.indexation.step,
    progress: state.indexation.progress
  };
}

export default connect(mapStateToProps)(Indexation);
