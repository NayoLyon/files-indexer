import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Icon, Header, Button, Tab, Progress } from "semantic-ui-react";

import MissingTab from "./MissingTab";
import DuplicateTab from "./DuplicateTab";

class AnalyzeView extends Component {
	static getStyles() {
		return {
			tabPaneStyle: {
				overflowY: "auto",
				height: "calc(100% - 3.5rem)"
			},
			buttonGroupStyle: {
				marginRight: "1rem"
			}
		};
	}
	constructor(props) {
		super(props);
		this.renderMissing = this.renderMissing.bind(this);
		this.renderDuplicates = this.renderDuplicates.bind(this);
	}

	renderMissing() {
		if (this.props.missingList.length === 0) {
			return null;
		}
		return {
			menuItem: `Missing (${this.props.missingList.length})`,
			render: () => (
				<MissingTab
					files={this.props.missingList}
					openDbFolderFor={this.props.openDbFolderFor}
					removeInDb={this.props.removeInDb}
				/>
			)
		};
	}
	renderDuplicates() {
		if (this.props.duplicateList.size === 0) {
			return null;
		}
		return {
			menuItem: `Duplicates (${this.props.duplicateList.size})`,
			render: () => (
				<DuplicateTab
					files={this.props.duplicateList}
					openDbFolderFor={this.props.openDbFolderFor}
					removeFile={this.props.removeFile}
				/>
			)
		};
	}

	render() {
		let content = null;
		if (!this.props.isAnalyzed && !this.props.loading) {
			content = null;
		} else if (this.props.loading) {
			content = (
				<Progress
					{...this.props.progress}
					progress={this.props.progress.total ? "ratio" : "percent"}
				>
					{this.props.step}
				</Progress>
			);
		} else if (this.props.isAnalyzed) {
			let infos = null;
			if (this.props.missingList.length || this.props.duplicateList.size) {
				const panes = [];
				const tabMissing = this.renderMissing();
				if (tabMissing) {
					panes.push(tabMissing);
				}
				const tabDuplicates = this.renderDuplicates();
				if (tabDuplicates) {
					panes.push(tabDuplicates);
				}
				infos = <Tab style={{ height: "100%" }} panes={panes} />;
			} else {
				infos = <p key="noErrors">No errors found in db.</p>;
			}
			content = (
				<div>
					{infos}
					{/* <Link to="/scan"> */}
					<Button onClick={this.props.goToScan}>Now scan folder</Button>
					{/* </Link> */}
				</div>
			);
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
						<Header>Analyze of folder {this.props.masterFolder}</Header>
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
		loading: state.analyzeState.loading,
		isAnalyzed: state.analyzeState.isAnalyzed,
		step: state.analyzeState.step,
		progress: state.analyzeState.progress,
		missingList: state.analyzeState.missingList,
		duplicateList: state.analyzeState.duplicateList
	};
}

export default connect(mapStateToProps)(AnalyzeView);
