import React from "react";
import { connect } from "react-redux";

import { selectMaster, selectToScan } from "../../modules/folders/foldersAction";
import { push } from "../../modules/router/routerActions";
import routes from "../../utils/routes";

import HomeView from "./HomeView";

const {
	remote: {
		dialog: { showOpenDialog }
	}
} = window.require("electron");

/*
For UI,
See http://reactdesktop.js.org/docs/windows/window/
Or https://xel-toolkit.org/ for an alternative to React desktop
Or https://www.material-ui.com/#/get-started/required-knowledge ???
*/
const HomeContainer = ({ masterFolder, toScanFolder, goToIndex, selectMaster, selectToScan }) => {
	const selectFolder = (defaultPath, actionFunc) => () => {
		showOpenDialog(
			{
				defaultPath,
				properties: ["openDirectory"]
			},
			actionFunc
		);
	};

	return (
		<HomeView
			onSelectMasterFolder={selectFolder(masterFolder, selectMaster)}
			onSelectToScanFolder={selectFolder(toScanFolder, selectToScan)}
			goToIndex={masterFolder && toScanFolder ? goToIndex : null}
			masterFolder={masterFolder}
			toScanFolder={toScanFolder}
		/>
	);
};

const mapStateToProps = state => ({
	masterFolder: state.foldersState.masterPath,
	toScanFolder: state.foldersState.toScanPath
});
const mapDispatchToProps = dispatch => ({
	goToIndex: () => dispatch(push(routes.index)),
	selectMaster: filePaths => {
		if (typeof filePaths !== "object" || filePaths.length < 1) {
			return;
		}
		dispatch(selectMaster(filePaths[0]));
	},
	selectToScan: filePaths => {
		if (typeof filePaths !== "object" || filePaths.length < 1) {
			return;
		}
		dispatch(selectToScan(filePaths[0]));
	}
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(HomeContainer);
