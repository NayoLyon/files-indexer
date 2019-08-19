import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Icon, Header, Button, Progress } from "semantic-ui-react";

import ResultContainer from "../result/ResultContainer";

class ScanView extends Component {
	render() {
		let content = null;
		if (!this.props.isScanned && !this.props.indexing) {
			content = <Button onClick={this.props.scan}>Start Scan</Button>;
		} else if (this.props.indexing) {
			content = (
				<React.Fragment>
					<Progress
						{...this.props.progress}
						progress={this.props.progress.total ? "ratio" : "percent"}
					>
						{this.props.step}
					</Progress>
					<p>Working on {this.props.fileProgress}...</p>
				</React.Fragment>
			);
		} else if (this.props.isScanned) {
			content = <ResultContainer />;
		}
		return (
			<Grid padded style={{ height: "100vh" }}>
				<Grid.Column stretched>
					<Grid.Row style={{ flex: "0 0 4rem" }}>
						<Button
							icon={<Icon name="arrow left" className="button" size="huge" />}
							onClick={this.props.goToIndex}
						/>
					</Grid.Row>
					<Grid.Row style={{ flex: "0 0 2rem" }}>
						<Header>Scan folder {this.props.toScanFolder}</Header>
					</Grid.Row>
					<Grid.Row style={{ flex: "1 1 10%", height: "10%" }}>{content}</Grid.Row>
				</Grid.Column>
			</Grid>
		);
	}
}

function mapStateToProps(state) {
	return {
		toScanFolder: state.foldersState.toScanPath,
		indexing: state.scanState.indexing,
		isScanned: state.scanState.isScanned,
		step: state.scanState.step,
		progress: state.scanState.progress,
		fileProgress: state.scanState.fileProgress
	};
}

export default connect(mapStateToProps)(ScanView);
