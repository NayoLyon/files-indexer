// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

type Props = {
  selectFolder: (isMaster: boolean) => void,
  isScanPossible: () => void,
  masterFolder: string,
  toScanFolder: string
};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <p>
            <button onClick={() => this.props.selectFolder(true)}>select master folder</button>
            <span>{this.props.masterFolder}</span>
          </p>
          <p>
            <button onClick={() => this.props.selectFolder(false)}>select folder to scan</button>
            <span>{this.props.toScanFolder}</span>
          </p>
          <Link
            to="/index"
            onClick={(e) => { if (!this.props.isScanPossible()) { e.preventDefault(); } }}
          >
            Start
          </Link>
        </div>
      </div>
    );
  }
}
