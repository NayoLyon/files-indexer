import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Icon, Header, Button, Divider, Progress } from "semantic-ui-react";

import IndexationAnomaliesView from "./IndexationAnomaliesView";

class IndexationView extends Component {
	render() {
		let content = null;
		if (!this.props.isIndexed && !this.props.indexing) {
			content = <Button onClick={this.props.index}>Start Indexation</Button>;
		} else if (this.props.indexing) {
			content = (
				<Progress
					{...this.props.progress}
					progress={this.props.progress.total ? "ratio" : "percent"}
				>
					{this.props.step}
				</Progress>
			);
		} else if (this.props.isIndexed) {
			// TODO displaying database content...
			content = (
				<div>
					<Header as="h2">Folder indexed...</Header>
					<p>{this.props.dbSize} elements indexed.</p>
					{/* <Link to="/scan"> */}
					<Button onClick={this.props.goToScan}>Now scan folder</Button>
					{/* </Link> */}
					<Button onClick={this.props.quickIndex}>Re-index</Button>
					<Button onClick={this.props.index}>Full re-indexation</Button>
					<Divider />
					{/* <Link to="/analyseDb"> */}
					<Button onClick={this.props.goToAnalyzeDb}>Analyse database content</Button>
					{/* </Link> */}
					<IndexationAnomaliesView />
				</div>
			);
		}
		return (
			<Grid padded style={{ height: "100vh" }}>
				<Grid.Column stretched>
					<Grid.Row style={{ flex: "0 0 4rem" }}>
						{/* <Link to="/"> */}
						<Button icon onClick={this.props.goToHome}>
							<Icon name="arrow left" size="huge" />
						</Button>
						{/* </Link> */}
					</Grid.Row>
					<Grid.Row style={{ flex: "0 0 2rem" }}>
						<Header>Indexation of folder {this.props.masterFolder}</Header>
					</Grid.Row>
					<Grid.Row style={{ flex: "1 1 10%", height: "10%" }}>{content}</Grid.Row>
				</Grid.Column>
			</Grid>
		);
	}
}

function mapStateToProps(state) {
	return {
		masterFolder: state.foldersState.masterPath,
		dbSize: state.indexationState.dbSize,
		indexing: state.indexationState.indexing,
		isIndexed: state.indexationState.isIndexed,
		step: state.indexationState.step,
		progress: state.indexationState.progress
	};
}

export default connect(mapStateToProps)(IndexationView);
