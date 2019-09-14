import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { doScan } from "../../api/filesystem";
import routes from "../../utils/routes";

import { endScan, scanProgress, startScan, scanProcessFile } from "../../modules/scan/scanAction";
import { push } from "../../modules/router/routerActions";

import ScanView from "./ScanView";

const ScanContainer = ({
	toScanFolder,
	indexing,
	isScanned,
	step,
	progress,
	fileProgress,
	startScan,
	scanProcessFile,
	scanProgress,
	endScan,
	goToIndex
}) => {
	const scan = async () => {
		await startScan();

		await doScan(
			toScanFolder,
			scanProcessFile,
			scanProgress,
			true
			// TODO add isCanceled
		);

		endScan();
	};

	return (
		<ScanView
			toScanFolder={toScanFolder}
			indexing={indexing}
			isScanned={isScanned}
			step={step}
			progress={progress}
			fileProgress={fileProgress}
			scan={scan}
			goToIndex={goToIndex}
		/>
	);
};

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
