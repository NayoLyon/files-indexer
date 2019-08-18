import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { doScan } from "../../api/filesystem";
import routes from "../../utils/routes";

import { endScan, scanProgress, startScan, scanProcessFile } from "../../modules/scan/scanAction";
import { push } from "../../modules/router/routerActions";

import ScanView from "./ScanView";

class ScanContainer extends Component {
	async scan() {
		await this.props.startScan();

		await doScan(
			this.props.toScanFolder,
			this.props.scanProcessFile,
			this.props.scanProgress,
			true
		);

		this.props.endScan();
	}

	render() {
		return <ScanView scan={this.scan.bind(this)} goToIndex={this.props.goToIndex} />;
	}
}

function mapStateToProps(state) {
	return {
		toScanFolder: state.foldersState.toScanPath
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ endScan, scanProgress, startScan, scanProcessFile, goToIndex: () => push(routes.index) },
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ScanContainer);
