import { Component } from "react";
import { connect } from "react-redux";
import RouterContainer from "./router";
// import Store from "./ElectronStore";

import { selectMaster, selectToScan } from "./modules/folders/foldersAction";

// const {
// 	remote: {
// 		app: { __store: configStore }
// 	}
// } = window.require("electron");
const Store = window.require("electron").remote.require("electron-store");

class App extends Component {
	componentDidMount() {
		window.addEventListener("dragenter", App.preventDrop, false);
		window.addEventListener("dragover", App.preventDrop, false);
		window.addEventListener("drop", App.preventDrop, false);

		const configStore = new Store();
		const masterFolder = configStore.get("masterFolder");
		const toScanFolder = configStore.get("toScanFolder");

		if (masterFolder) {
			this.props.dispatch(selectMaster(masterFolder));
		}
		if (toScanFolder) {
			this.props.dispatch(selectToScan(toScanFolder));
		}
	}
	componentWillUnmount() {
		window.removeEventListener("dragenter", App.preventDrop, false);
		window.removeEventListener("dragover", App.preventDrop, false);
		window.removeEventListener("drop", App.preventDrop, false);
	}
	static preventDrop(e) {
		e.preventDefault();
	}
	render() {
		return RouterContainer;
	}
}

export default connect()(App);
