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
				<Progress
					{...this.props.progress}
					progress={this.props.progress.total ? "ratio" : "percent"}
				>
					{this.props.step}
				</Progress>
			);
		} else if (this.props.isScanned) {
			content = <ResultContainer />;
		}
		return (
			<Grid padded style={{ height: "100vh" }}>
				<Grid.Column stretched>
					<Grid.Row style={{ flex: "0 0 4rem" }}>
						{/* <Link to="/index"> */}
						<Button onClick={this.props.goToIndex}>
							<Icon name="arrow left" size="huge" />
						</Button>
						{/* </Link> */}
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
		progress: state.scanState.progress
	};
}

export default connect(mapStateToProps)(ScanView);
