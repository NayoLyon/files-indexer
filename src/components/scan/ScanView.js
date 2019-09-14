import React from "react";
import { Grid, Icon, Header, Button, Progress } from "semantic-ui-react";

import ResultContainer from "../result/ResultContainer";

const ScanView = ({
	isScanned,
	indexing,
	scan,
	progress,
	step,
	fileProgress,
	goToIndex,
	toScanFolder
}) => (
	<Grid padded style={{ height: "100vh" }}>
		<Grid.Column stretched>
			<Grid.Row style={{ flex: "0 0 4rem" }}>
				<Button
					icon={<Icon name="arrow left" className="button" size="huge" />}
					onClick={goToIndex}
				/>
			</Grid.Row>
			<Grid.Row style={{ flex: "0 0 2rem" }}>
				<Header>Scan folder {toScanFolder}</Header>
			</Grid.Row>
			<Grid.Row style={{ flex: "1 1 10%", height: "10%" }}>
				{!isScanned && !indexing ? (
					<Button onClick={scan}>Start Scan</Button>
				) : indexing ? (
					<React.Fragment>
						<Progress {...progress} progress={progress.total ? "ratio" : "percent"}>
							{step}
						</Progress>
						<p>Working on {fileProgress}...</p>
					</React.Fragment>
				) : (
					<ResultContainer />
				)}
			</Grid.Row>
		</Grid.Column>
	</Grid>
);

export default ScanView;
