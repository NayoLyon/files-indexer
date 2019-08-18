import React, { Component } from "react";
import { connect } from "react-redux";
import HomeView from "./HomeView";
// import * as FoldersActions from '../../modules/folders/foldersAction';
import { selectMaster, selectToScan } from "../../modules/folders/foldersAction";
import { push } from "../../modules/router/routerActions";

import routes from "../../utils/routes";

const { remote } = window.require("electron");

// const { dialog, app } = remote;
const { dialog } = remote;

// const { __store: configStore } = app;
const Store = remote.require("electron-store");

/*
For UI,
See http://reactdesktop.js.org/docs/windows/window/
Or https://xel-toolkit.org/ for an alternative to React desktop
Or https://www.material-ui.com/#/get-started/required-knowledge ???
*/
class HomeContainer extends Component {
	constructor(props) {
		super(props);

		this.isScanPossible = this.isScanPossible.bind(this);
		this.goToIndex = this.goToIndex.bind(this);
		this.selectFolder = this.selectFolder.bind(this);
		this.setFolder = this.setFolder.bind(this);
		// console.log({ ...app }, app.getPath("userData"));
	}
	selectFolder(isMaster) {
		dialog.showOpenDialog(
			{
				defaultPath: isMaster ? this.props.masterFolder : this.props.toScanFolder,
				properties: ["openDirectory"]
			},
			this.setFolder(isMaster)
		);
	}

	setFolder(isMaster) {
		return filePaths => {
			if (typeof filePaths !== "object" || filePaths.length < 1) {
				return;
			}
			const configStore = new Store();
			if (isMaster) {
				this.props.dispatch(selectMaster(filePaths[0]));
				configStore.set("masterFolder", filePaths[0]);
			} else {
				this.props.dispatch(selectToScan(filePaths[0]));
				configStore.set("toScanFolder", filePaths[0]);
			}
		};
	}

	isScanPossible() {
		return (
			typeof this.props.masterFolder === "string" &&
			typeof this.props.toScanFolder === "string" &&
			this.props.masterFolder !== "" &&
			this.props.toScanFolder !== ""
		);
	}
	goToIndex() {
		if (this.isScanPossible()) {
			this.props.dispatch(push(routes.index));
		}
	}

	render() {
		return (
			<HomeView
				selectFolder={this.selectFolder}
				goToIndex={this.goToIndex}
				masterFolder={this.props.masterFolder}
				toScanFolder={this.props.toScanFolder}
			/>
		);
	}
}

function mapStateToProps(state) {
	return {
		masterFolder: state.foldersState.masterPath,
		toScanFolder: state.foldersState.toScanPath
	};
}

export default connect(mapStateToProps)(HomeContainer);
