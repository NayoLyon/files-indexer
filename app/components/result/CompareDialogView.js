// @flow
import React, { Component } from 'react';
import { Modal, Button, Label } from 'semantic-ui-react';

import { FileProps, FilePropsDb, FilePropsType } from '../../api/filesystem';

import FileDetailsView from './FileDetailsView';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  close: () => void,
  open: boolean,
  dbFilesFirst: boolean,
  files: Array<FileProps | null> | null,
  dbFiles: Array<FilePropsDb | null> | null
};

export default class CompareDialogView extends Component<Props> {
  props: Props;

  static renderFiles(
    files: FilePropsType | Array<FilePropsType>,
    openFolderFunc: FilePropsType => void
  ) {
    const res = [];
    if (files instanceof Array) {
      const type = CompareDialogView.getType(files[0]);
      files.forEach(file => {
        res.push(
          <FileDetailsView key={`${type}_${file.relpath}`} file={file} openFolderFor={openFolderFunc} />
        );
      });
    } else {
      const type = CompareDialogView.getType(files);
      res.push(
        <FileDetailsView key={`${type}_${files.relpath}`} file={files} openFolderFor={openFolderFunc} />
      );
    }
    return res;
  }
  static getType(file: FilePropsType) {
    if (file instanceof FileProps) {
      return 'scan';
    } else if (file instanceof FilePropsDb) {
      return 'db';
    }
    return 'unknown';
  }
  static getDivider(topLabel: string, bottomLabel: string) {
    const inlineStyle = {
      divider: {
        flex: '0 1',
        margin: '1rem auto',
        textAlign: 'center'
      },
      dividerLine: {
        borderLeft: '1px solid rgba(34, 36, 38, 0.15)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        height: 'calc(50% - 2.5em)',
        width: 0,
        display: 'inline-block'
      },
      dividerLabel: {
        display: 'block',
        margin: '0.4em'
      }
    };

    return (
      <div key="divider" style={{ ...inlineStyle.divider, color: 'black' }}>
        <div style={inlineStyle.dividerLine} />
        <Label
          basic
          color="grey"
          pointing="left"
          style={{ ...inlineStyle.dividerLabel, marginTop: 0 }}
        >
          {topLabel}
        </Label>
        <Label basic color="grey" pointing="right" style={inlineStyle.dividerLabel}>
          {bottomLabel}
        </Label>
        <div style={inlineStyle.dividerLine} />
      </div>
    );
  }

  render() {
    const inlineStyle = {
      modal: {
        marginTop: 'auto !important',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      },
      content: {
        overflowX: 'auto',
        padding: 0,
        paddingTop: '1rem'
      }
    };
    if (!this.props.files || !this.props.dbFiles) {
      return null;
    }

    let filesDetails;

    // Display the files in the given order
    if (this.props.dbFilesFirst) {
      filesDetails = CompareDialogView.renderFiles(this.props.dbFiles, this.props.openDbFolderFor);
      filesDetails.push(CompareDialogView.getDivider('Db', 'Folder'));
      filesDetails = filesDetails.concat(
        CompareDialogView.renderFiles(this.props.files, this.props.openFolderFor)
      );
    } else {
      filesDetails = CompareDialogView.renderFiles(this.props.files, this.props.openFolderFor);
      filesDetails.push(CompareDialogView.getDivider('Folder', 'Db'));
      filesDetails = filesDetails.concat(
        CompareDialogView.renderFiles(this.props.dbFiles, this.props.openDbFolderFor)
      );
    }
    return (
      <Modal open={this.props.open} onClose={this.props.close} style={inlineStyle.modal}>
        {/* <Modal.Header>Select a Photo</Modal.Header> */}
        <Modal.Content image style={inlineStyle.content}>
          {filesDetails}
        </Modal.Content>
        <Modal.Actions>
          <Button icon="close" onClick={this.props.close} />
        </Modal.Actions>
      </Modal>
    );
  }
}
