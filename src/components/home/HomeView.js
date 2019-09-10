import React from "react";
import { Grid, Container, Form, Button, Icon, Label } from "semantic-ui-react";

const HomeView = ({
	masterFolder,
	toScanFolder,
	onSelectMasterFolder,
	onSelectToScanFolder,
	goToIndex
}) => (
	<Grid padded verticalAlign="middle" stretched style={{ height: "100vh" }}>
		<Grid.Column>
			<Form as={Container}>
				<Form.Group>
					<Button as="div" labelPosition="right">
						<Button onClick={onSelectMasterFolder}>
							<Icon name="folder open" />
							select master folder
						</Button>
						<Label basic>{masterFolder}</Label>
					</Button>
				</Form.Group>
				<Form.Group>
					<Button as="div" labelPosition="right">
						<Button onClick={onSelectToScanFolder}>
							<Icon name="folder open" />
							select folder to scan
						</Button>
						<Label basic>{toScanFolder}</Label>
					</Button>
				</Form.Group>
				<Form.Group>
					<Button
						icon
						labelPosition="right"
						onClick={goToIndex}
						disabled={!masterFolder || !toScanFolder}
					>
						Start
						<Icon name="right arrow" />
					</Button>
				</Form.Group>
			</Form>
		</Grid.Column>
	</Grid>
);

export default HomeView;
