// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Grid, Icon, Header, Button, Table } from 'semantic-ui-react';

import { printValue } from '../../utils/format';
import { FilePropsDb, FileProps } from '../../api/filesystem';

type Props = {
  index: () => void,
  indexDiff: () => void,
  masterFolder: string,
  dbSize: number,
  indexing: boolean,
  isIndexed: boolean,
  step: string,
  progress: number,
  duplicates: Map<string, { dbFile: FilePropsDb, file: FileProps, diff: Set<string> }>
};

class IndexationView extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.renderAnomalies = this.renderAnomalies.bind(this);
  }

  renderAnomalies() {
    if (this.props.duplicates.size === 0) {
      return null;
    }

    const listItems = [];
    this.props.duplicates.forEach((dupFile, relpath) => {
      const { dbFile, file, diff } = dupFile;
      let isFirst = true;
      diff.forEach(prop => {
        let mainCell = null;
        if (isFirst) {
          mainCell = (
            <Table.Cell key="relpath" textAlign="center" rowSpan={diff.size}>
              {relpath}
            </Table.Cell>
          );
        }
        let rowContent;
        if (prop === 'new') {
          rowContent = [
            <Table.Cell key="prop" textAlign="center">
              {prop}
            </Table.Cell>,
            <Table.Cell key="filevalue" textAlign="center" />,
            <Table.Cell key="dbvalue" />
          ];
        } else {
          rowContent = [
            <Table.Cell key="prop" textAlign="center">
              {prop}
            </Table.Cell>,
            <Table.Cell key="filevalue" textAlign="center">
              {printValue(file, prop)}
            </Table.Cell>,
            <Table.Cell key="dbvalue" textAlign="center">
              {printValue(dbFile, prop)}
            </Table.Cell>
          ];
        }
        /* eslint-disable react/no-array-index-key */
        listItems.push(
          <Table.Row key={`${relpath}_${prop}`}>
            {mainCell}
            {rowContent}
          </Table.Row>
        );
        /* eslint-enable react/no-array-index-key */
        isFirst = false;
      });
    });

    return (
      <Table>
        <Table.Body>{listItems}</Table.Body>
      </Table>
    );
  }
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
      const indexAnomalies = this.renderAnomalies();
      content = (
        <div>
          <Header as="h2">Folder indexed...</Header>
          <p>{this.props.dbSize} elements indexed.</p>
          <Link to="/scan">
            <Button>Now scan folder</Button>
          </Link>
          <Button onClick={this.props.indexDiff}>Re-index</Button>
          <Button onClick={this.props.index}>Full re-indexation</Button>
          {indexAnomalies}
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
    progress: state.indexationState.progress,
    duplicates: state.indexationState.duplicates
  };
}

export default connect(mapStateToProps)(IndexationView);
