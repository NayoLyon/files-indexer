import React, { useEffect } from "react";
import { connect } from "react-redux";
// import Store from "./ElectronStore";

import { loadConfig } from "./modules/folders/foldersAction";

import AppLayout from "./components/layouts/AppLayout";

// const {
// 	remote: {
// 		app: { __store: configStore }
// 	}
// } = window.require("electron");

const preventDrop = e => e.preventDefault();
const App = () => {
	useEffect(() => {
		window.addEventListener("dragenter", preventDrop, false);
		window.addEventListener("dragover", preventDrop, false);
		window.addEventListener("drop", preventDrop, false);
		loadConfig();

		return () => {
			window.removeEventListener("dragenter", preventDrop, false);
			window.removeEventListener("dragover", preventDrop, false);
			window.removeEventListener("drop", preventDrop, false);
		};
	}, []);
	return <AppLayout />;
};

const mapDispatchToProps = dispatch => ({ loadConfig: dispatch(loadConfig()) });

export default connect(
	null,
	mapDispatchToProps
)(App);
