// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

type Props = {
  startIndexation: () => void,
  masterFolder: string,
  dbSize: number
};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    let content = null;
    if (this.props.dbSize === 0) {
      content = <button onClick={this.props.startIndexation}>Start Indexation</button>;
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
