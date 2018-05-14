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
  file: FileProps | null,
  dbFiles: Array<FilePropsDb> | null
};

export default class CompareDialog extends Component<Props> {
  props: Props;

  static renderFiles(files: Array<FilePropsDb>, openFolderFunc: FilePropsDb => void) {
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
    if (!this.props.file) {
      return null;
    }
    return (
      <Modal open={this.props.open} onClose={this.props.close} style={inlineStyle.modal}>
        {/* <Modal.Header>Select a Photo</Modal.Header> */}
        <Modal.Content image style={inlineStyle.content}>
          <FileDetails file={this.props.file} openFolderFor={this.props.openFolderFor} />
          {CompareDialog.renderFiles(this.props.dbFiles, this.props.openDbFolderFor)}
        </Modal.Content>
        <Modal.Actions>
          <Button icon="close" onClick={this.props.close} />
        </Modal.Actions>
      </Modal>
    );
  }
}
