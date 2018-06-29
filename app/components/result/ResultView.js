// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab, Menu, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb, FilePropsDbDuplicates } from '../../api/filesystem';
import { CONST_SCAN_TYPE_IDENTICAL, ConstScanType } from '../../modules/scan/scanAction';

import ResultTabNewView from './ResultTabNewView';
import ResultTabModifiedView from './ResultTabModifiedView';
import ResultTabDuplicateView from './ResultTabDuplicateView';
import ResultTabReferencesView from './ResultTabReferencesView';
import ResultTabIdenticalView from './ResultTabIdenticalView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  copyModifiedAttributeTo: (FileProps, FilePropsDb) => void,
  removeFile: FileProps => void,
  removeAllFiles: ConstScanType => void,
  copyNameAttributeTo: (FileProps, FilePropsDb) => void,
  setTabActive: string => void,
  loadingResult: boolean,
  activeTab: string,
  identicals: Array<FileProps>,
  newFiles: Array<FileProps>,
  modified: Array<FileProps>,
  duplicates: Array<FileProps>,
  dbFilesRef: Array<FilePropsDbDuplicates>
};

class ResultView extends Component<Props> {
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
    this.tabChange = this.tabChange.bind(this);
  }

  tabChange(event, data) {
    this.props.setTabActive(data.panes[data.activeIndex].key);
  }

  render() {
    if (this.props.loadingResult) {
      return null;
    }
    const inlineStyles = {
      trashButtonStyle: { fontSize: '0.7rem', marginRight: '-0.8rem', marginLeft: '0.4rem' }
    };
    const panes = [];
    if (this.props.dbFilesRef.length > 0) {
      const duplicatefileRefs = this.props.dbFilesRef;
      if (duplicatefileRefs.length > 0) {
        panes.push({
          menuItem: `Caution: several files refers to the same db file!! (${
            duplicatefileRefs.length
          })`,
          key: 'references',
          render: () => (
            <ResultTabReferencesView
              files={duplicatefileRefs}
              removeFile={this.props.removeFile}
              openDbFolderFor={this.props.openDbFolderFor}
              openFolderFor={this.props.openFolderFor}
            />
          )
        });
      }
    }
    if (this.props.identicals.length > 0) {
      panes.push({
        menuItem: (
          <Menu.Item key="identical">
            Identical files ({this.props.identicals.length})<Button
              icon="trash"
              style={inlineStyles.trashButtonStyle}
              onClick={() => {
                this.props.removeAllFiles(CONST_SCAN_TYPE_IDENTICAL);
              }}
            />
          </Menu.Item>
        ),
        key: 'identical',
        render: () => (
          <ResultTabIdenticalView
            files={this.props.identicals}
            removeFile={this.props.removeFile}
            openDbFolderFor={this.props.openDbFolderFor}
            openFolderFor={this.props.openFolderFor}
          />
        )
      });
    }
    if (this.props.newFiles.length > 0) {
      panes.push({
        menuItem: `New files (${this.props.newFiles.length})`,
        key: 'new',
        render: () => (
          <ResultTabNewView
            files={this.props.newFiles}
            openFolderFor={this.props.openFolderFor}
            removeFile={this.props.removeFile}
          />
        )
      });
    }
    if (this.props.modified.length > 0) {
      panes.push({
        menuItem: `Modified files (${this.props.modified.length})`,
        key: 'modified',
        render: () => (
          <ResultTabModifiedView
            files={this.props.modified}
            copyModifiedAttributeTo={this.props.copyModifiedAttributeTo}
            openDbFolderFor={this.props.openDbFolderFor}
            openFolderFor={this.props.openFolderFor}
            removeFile={this.props.removeFile}
            copyNameAttributeTo={this.props.copyNameAttributeTo}
          />
        )
      });
    }
    if (this.props.duplicates.length > 0) {
      panes.push({
        menuItem: `Possible duplicates (${this.props.duplicates.length})`,
        key: 'duplicates',
        render: () => (
          <ResultTabDuplicateView
            files={this.props.duplicates}
            removeFile={this.props.removeFile}
            openDbFolderFor={this.props.openDbFolderFor}
            openFolderFor={this.props.openFolderFor}
          />
        )
      });
    }
    let activeIndex = panes.findIndex(pane => pane.key === this.props.activeTab);
    if (activeIndex < 0) {
      activeIndex = 0;
    }
    return (
      <Tab
        style={{ height: '100%' }}
        panes={panes}
        activeIndex={activeIndex}
        onTabChange={this.tabChange}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    loadingResult: state.resultState.loading,
    activeTab: state.resultState.activeTab,
    identicals: state.resultState.identicals,
    newFiles: state.resultState.newFiles,
    modified: state.resultState.modified,
    duplicates: state.resultState.duplicates,
    dbFilesRef: state.resultState.dbFilesRef
  };
}

export default connect(mapStateToProps)(ResultView);
