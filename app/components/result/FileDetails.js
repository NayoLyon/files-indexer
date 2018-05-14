import React, { Component } from 'react';
import { Image, Card, Icon } from 'semantic-ui-react';
import { lookup } from 'mime-types';

import { FilePropsType } from '../../api/filesystem';
import { printValue } from '../../utils/format';

type Props = {
  openFolderFor: FilePropsType => void,
  file: FilePropsType
};

export default class FileDetails extends Component<Props> {
  props: Props;
  static inlineStyles = {
    card: {
      margin: '1em',
      flex: '1 1'
    },
    genericHeaderStyles: {
      color: 'red',
      fontWeight: 'bolder'
    }
  };

  constructor(props) {
    super(props);
    this.getProp = this.getProp.bind(this);
    this.computePreview = this.computePreview.bind(this);
  }
  getProp(prop) {
    return this.props.file ? printValue(this.props.file, prop) : '';
  }
  computePreview() {
    const mimeType = lookup(this.getProp('path'));
    if (mimeType.match('^image/')) {
      return <Image size="huge" src={this.getProp('path')} />;
    }
    return (
      <Card.Header style={FileDetails.inlineStyles.genericHeaderStyles}>{mimeType}</Card.Header>
    );
  }

  render() {
    return (
      <Card style={FileDetails.inlineStyles.card}>
        {this.computePreview()}
        <Card.Content>
          <Card.Header>{this.getProp('name')}</Card.Header>
          <Card.Description>
            Size:&nbsp;
            <span className="date">{this.getProp('size')}</span>
          </Card.Description>
          <Card.Meta>
            Modified on&nbsp;
            <span className="date">{this.getProp('modified')}</span>
          </Card.Meta>
          <Card.Description>Created on&nbsp;{this.getProp('created')}</Card.Description>
        </Card.Content>
        <Card.Content
          extra
          onClick={() => {
            this.props.openFolderFor(this.props.file);
          }}
        >
          <a>
            <Icon name="folder" />
            {this.getProp('relpath')}
          </a>
        </Card.Content>
      </Card>
    );
  }
}
