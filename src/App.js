import React, { Component } from "react";
import { connect } from "react-redux";
// import Store from "./ElectronStore";

import { loadConfig } from "./modules/folders/foldersAction";

import AppLayout from "./components/layouts/AppLayout";

// const {
// 	remote: {
// 		app: { __store: configStore }
// 	}
// } = window.require("electron");

class App extends Component {
	componentDidMount() {
		window.addEventListener("dragenter", App.preventDrop, false);
		window.addEventListener("dragover", App.preventDrop, false);
		window.addEventListener("drop", App.preventDrop, false);

		this.props.dispatch(loadConfig());
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
		return <AppLayout />;
	}
}

export default connect()(App);
