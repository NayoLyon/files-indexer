// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Grid, Icon, Header, Button } from 'semantic-ui-react';

import IndexationAnomaliesView from './IndexationAnomaliesView';

type Props = {
  index: () => void,
  quickIndex: () => void,
  masterFolder: string,
  dbSize: number,
  indexing: boolean,
  isIndexed: boolean,
  step: string,
  progress: number
};

class IndexationView extends Component<Props> {
  props: Props;

  render() {
    let content = null;
    if (!this.props.isIndexed && !this.props.indexing) {
      content = <Button onClick={this.props.index}>Start Indexation</Button>;
    } else if (this.props.indexing) {
      content = (
        <Header as="h2">
          {this.props.step} at {Math.round(this.props.progress * 100)}%
        </Header>
      );
    } else if (this.props.isIndexed) {
      // TODO displaying database content...
      content = (
        <div>
          <Header as="h2">Folder indexed...</Header>
          <p>{this.props.dbSize} elements indexed.</p>
          <Link to="/scan">
            <Button>Now scan folder</Button>
          </Link>
          <Button onClick={this.props.quickIndex}>Re-index</Button>
          <Button onClick={this.props.index}>Full re-indexation</Button>
          <IndexationAnomaliesView />
        </div>
      );
    }
    return (
      <Grid padded style={{ height: '100vh' }}>
        <Grid.Column stretched>
          <Grid.Row style={{ flex: '0 0 4rem' }}>
            <Link to="/">
              <Icon name="arrow left" size="huge" />
            </Link>
          </Grid.Row>
          <Grid.Row style={{ flex: '0 0 2rem' }}>
            <Header>Indexation of folder {this.props.masterFolder}</Header>
          </Grid.Row>
          <Grid.Row style={{ flex: '1 1 10%', height: '10%' }}>{content}</Grid.Row>
        </Grid.Column>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    masterFolder: state.foldersState.masterPath,
    dbSize: state.indexationState.dbSize,
    indexing: state.indexationState.indexing,
    isIndexed: state.indexationState.isIndexed,
    step: state.indexationState.step,
    progress: state.indexationState.progress
  };
}

export default connect(mapStateToProps)(IndexationView);
