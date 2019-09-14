import React from "react";
import { Grid, Icon, Header, Button, Progress } from "semantic-ui-react";

import AnalyzeViewContentAnomalies from "./AnalyzeViewContentAnomalies";

const AnalyzeViewContent = ({ isAnalyzed, loading, progress, step, goToScan, ...props }) => {
	return !isAnalyzed && !loading ? null : loading ? (
		<Progress {...progress} progress={progress.total ? "ratio" : "percent"}>
			{step}
		</Progress>
	) : (
		<div>
			<AnalyzeViewContentAnomalies {...props} />
			<Button onClick={goToScan}>Now scan folder</Button>
		</div>
	);
};

const AnalyzeView = ({ masterFolder, goToIndex, ...props }) => {
	return (
		<Grid padded style={{ height: "100vh" }}>
			<Grid.Column stretched>
				<Grid.Row style={{ flex: "0 0 4rem" }}>
					<Button
						icon={<Icon name="arrow left" className="button" size="huge" />}
						onClick={goToIndex}
					/>
				</Grid.Row>
				<Grid.Row style={{ flex: "0 0 2rem" }}>
					<Header>Analyze of folder {masterFolder}</Header>
				</Grid.Row>
				<Grid.Row style={{ flex: "1 1 10%", height: "10%" }}>
					<AnalyzeViewContent {...props} />
				</Grid.Row>
			</Grid.Column>
		</Grid>
	);
};

export default AnalyzeView;
