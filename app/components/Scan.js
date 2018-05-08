// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from './Home.css';
import ScanResult from './ScanResult';

type Props = {
  scan: () => void,
  toScanFolder: string,
  indexing: boolean,
  isScanned: boolean,
  step: string,
  progress: number
};

class Scan extends Component<Props> {
  props: Props;

  render() {
    let content = null;
    if (!this.props.isScanned && !this.props.indexing) {
      content = <button onClick={this.props.scan}>Start Scan</button>;
    } else if (this.props.indexing) {
      content = (
        <div>
          <h2>
            {this.props.step} at {this.props.progress}%
          </h2>
        </div>
      );
    } else if (this.props.isScanned) {
      content = <ScanResult />;
    }
    return (
      <div>
        <div className={styles.backButton} data-tid="backButton">
          <Link to="/index">
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <div>
          <h1>Scan folder {this.props.toScanFolder}</h1>
        </div>
        <div>{content}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    toScanFolder: state.folders.toScanPath,
    indexing: state.scan.indexing,
    isScanned: state.scan.isScanned,
    step: state.scan.step,
    progress: state.scan.progress
  };
}

export default connect(mapStateToProps)(Scan);
