// @flow
import React, { Component } from 'react';
import { Modal, Button } from 'semantic-ui-react';

import { FileProps, FilePropsDb } from '../../api/filesystem';

import FileDetails from './FileDetails';

type Props = {
  openFolderFor: FileProps => void,
  openDbFolderFor: FilePropsDb => void,
  close: () => void,
  open: boolean,
  files: Array<FileProps | null>,
  dbFile: FilePropsDb | null
};

export default class CompareDialog extends Component<Props> {
  props: Props;

  static renderFiles(files: Array<FileProps>, openFolderFunc: FileProps => void) {
    const res = [];
    files.forEach(file => {
      res.push(<FileDetails key={file.relpath} file={file} openFolderFor={openFolderFunc} />);
    });
    return res;
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
    if (!this.props.dbFile) {
      return null;
    }
    return (
      <Modal open={this.props.open} onClose={this.props.close} style={inlineStyle.modal}>
        <Modal.Header>Select a Photo</Modal.Header>
        <Modal.Content image style={inlineStyle.content}>
          <FileDetails file={this.props.dbFile} openFolderFor={this.props.openDbFolderFor} />
          {CompareDialog.renderFiles(this.props.files, this.props.openFolderFor)}
        </Modal.Content>
        <Modal.Actions>
          <Button icon="close" onClick={this.props.close} />
        </Modal.Actions>
      </Modal>
    );
  }
}
