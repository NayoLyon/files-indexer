// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Grid, Icon, Header, Button, Tab } from 'semantic-ui-react';

import { FilePropsDb } from '../../api/filesystem';

import MissingTab from './MissingTab';
import DuplicateTab from './DuplicateTab';

type Props = {
  removeFile: FilePropsDb => void,
  removeInDb: FilePropsDb => void,
  openDbFolderFor: FilePropsDb => void,
  masterFolder: string,
  loading: boolean,
  isAnalysed: boolean,
  step: string,
  progress: number,
  missingList: Array<FilePropsDb>,
  duplicateList: Map<string, Array<FilePropsDb>>
};

class AnalyseView extends Component<Props> {
  props: Props;
  static getStyles() {
    return {
      tabPaneStyle: {
        overflowY: 'auto',
        height: 'calc(100% - 3.5rem)'
      },
      buttonGroupStyle: {
        marginRight: '1rem'
      }
    };
  }
  constructor(props) {
    super(props);
    this.renderMissing = this.renderMissing.bind(this);
    this.renderDuplicates = this.renderDuplicates.bind(this);
  }

  renderMissing() {
    if (this.props.missingList.length === 0) {
      return null;
    }
    return {
      menuItem: `Missing (${this.props.missingList.length})`,
      render: () => (
        <MissingTab
          files={this.props.missingList}
          openDbFolderFor={this.props.openDbFolderFor}
          removeInDb={this.props.removeInDb}
        />
      )
    };
  }
  renderDuplicates() {
    if (this.props.duplicateList.size === 0) {
      return null;
    }
    return {
      menuItem: `Duplicates (${this.props.duplicateList.size})`,
      render: () => (
        <DuplicateTab
          files={this.props.duplicateList}
          openDbFolderFor={this.props.openDbFolderFor}
          removeFile={this.props.removeFile}
        />
      )
    };
  }

  render() {
    let content = null;
    if (!this.props.isAnalysed && !this.props.loading) {
      content = null;
    } else if (this.props.loading) {
      content = (
        <Header as="h2">
          {this.props.step} at {Math.floor(this.props.progress * 100)}%
        </Header>
      );
    } else if (this.props.isAnalysed) {
      let infos = null;
      if (this.props.missingList.length || this.props.duplicateList.size) {
        const panes = [];
        const tabMissing = this.renderMissing();
        if (tabMissing) {
          panes.push(tabMissing);
        }
        const tabDuplicates = this.renderDuplicates();
        if (tabDuplicates) {
          panes.push(tabDuplicates);
        }
        infos = <Tab style={{ height: '100%' }} panes={panes} />;
      } else {
        infos = <p key="noErrors">No errors found in db.</p>;
      }
      content = (
        <div>
          {infos}
          <Link to="/scan">
            <Button>Now scan folder</Button>
          </Link>
        </div>
      );
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
            <Header>Analyse of folder {this.props.masterFolder}</Header>
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
    loading: state.analyseState.loading,
    isAnalysed: state.analyseState.isAnalysed,
    step: state.analyseState.step,
    progress: state.analyseState.progress,
    missingList: state.analyseState.missingList,
    duplicateList: state.analyseState.duplicateList
  };
}

export default connect(mapStateToProps)(AnalyseView);
