// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Container, Form, Button, Icon, Label } from 'semantic-ui-react';

type Props = {
  selectFolder: (isMaster: boolean) => void,
  isScanPossible: () => void,
  masterFolder: string,
  toScanFolder: string
};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <Grid padded verticalAlign="middle" stretched style={{ height: '100vh' }}>
        <Grid.Column>
          <Form as={Container}>
            <Form.Group>
              <Button as="div" labelPosition="right">
                <Button onClick={() => this.props.selectFolder(true)}>
                  <Icon name="folder open" />
                  select master folder
                </Button>
                <Label basic>{this.props.masterFolder}</Label>
              </Button>
            </Form.Group>
            <Form.Group>
              <Button as="div" labelPosition="right">
                <Button onClick={() => this.props.selectFolder(false)}>
                  <Icon name="folder open" />
                  select folder to scan
                </Button>
                <Label basic>{this.props.toScanFolder}</Label>
              </Button>
            </Form.Group>
            <Form.Group>
              <Link
                to="/index"
                onClick={e => {
                  if (!this.props.isScanPossible()) {
                    e.preventDefault();
                  }
                }}
              >
                <Button icon labelPosition="right">
                  Start
                  <Icon name="right arrow" />
                </Button>
              </Link>
            </Form.Group>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}
