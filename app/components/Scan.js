// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Grid, Icon, Header, Button } from 'semantic-ui-react';

import ScanResultPage from './ScanResultPage';

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
      content = <Button onClick={this.props.scan}>Start Scan</Button>;
    } else if (this.props.indexing) {
      content = (
        <Header as="h2">
          {this.props.step} at {Math.round(this.props.progress * 100)}%
        </Header>
      );
    } else if (this.props.isScanned) {
      content = <ScanResultPage />;
    }
    return (
      <Grid padded style={{ height: '100vh' }}>
        <Grid.Column stretched>
          <Grid.Row style={{ flex: '0 0 4rem' }}>
            <Link to="/index">
              <Icon name="arrow left" size="huge" />
            </Link>
          </Grid.Row>
          <Grid.Row style={{ flex: '0 0 2rem' }}>
            <Header>Scan folder {this.props.toScanFolder}</Header>
          </Grid.Row>
          <Grid.Row style={{ flex: '1 1 10%', height: '10%' }}>{content}</Grid.Row>
        </Grid.Column>
      </Grid>
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
