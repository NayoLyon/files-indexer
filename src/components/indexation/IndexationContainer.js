import React, { Component } from "react";
import { connect } from "react-redux";

import { bindActionCreators } from "redux";

import {
	createDatabase,
	indexDuplicate,
	startIndexation,
	loadDatabase,
	endIndexation,
	indexProgress
} from "../../modules/indexation/indexationAction";
import { doScan, FilePropsDb } from "../../api/filesystem";
import { findDb, updateDb, insertDb } from "../../api/database";
import { push } from "../../modules/router/routerActions";

import routes from "../../utils/routes";

import LoaderCustom from "../shared/LoaderCustom";
import IndexationView from "./IndexationView";

class IndexationContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			masterFolder: undefined
		};
		this.processFileWithHash = this.processFileWithHash.bind(this);
		this.startIndex = this.startIndex.bind(this);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		const { masterFolder } = nextProps;
		if (masterFolder !== prevState.masterFolder) {
			if (masterFolder) {
				nextProps.createDatabase(masterFolder);
			}

			return { masterFolder };
		}
		return null;
	}

	// This method returns a function to process a file scanned on the disk.
	// This method returns either the function to process a file with its hash already computed,
	// or the function to process a file with its hash NOT YET computed.
	processFileWithHash(hashComputed = true) {
		return async fileProps => {
			const occurences = await findDb(
				this.props.masterFolder,
				{ relpath: fileProps.relpath },
				FilePropsDb
			);
			if (occurences.length) {
				if (occurences.length > 1) {
					console.error(
						`More than 1 occurence for relpath ${
							fileProps.relpath
						}!! This should never happen! Will only compare to the first one...`
					);
					console.error(occurences);
				}

				// File already indexed... Check that the file is correct in db or update it...
				let diff = fileProps.compareToSamePath(occurences[0]);
				if (!hashComputed) {
					diff.delete("hash");
				}
				if (diff.size) {
					if (!hashComputed) {
						// There are differences between the files... Recompute the hash and relaunch compare to include the hash
						await fileProps.computeHash();
						diff = fileProps.compareToSamePath(occurences[0]);
					}

					// Then update the db and log
					this.props.indexDuplicate(occurences[0], fileProps, diff);
					await updateDb(
						this.props.masterFolder,
						occurences[0].cloneFromSamePath(fileProps)
					);
				}
			} else {
				if (!hashComputed) {
					await fileProps.computeHash();
					console.info("Adding new file in db", fileProps);
					this.props.indexDuplicate(undefined, fileProps, new Set(["new"]));
				}
				await insertDb(this.props.masterFolder, fileProps.toFilePropsDb());
			}
		};
	}
	// This method returns the function to index the db folder.
	// This method returns either the function to perform a full re-indexation (hash computed, withHash=true)
	// or the function to perform a quick re-indexation (no hash computed unless file is modified or new, withHash=false)
	startIndex(withHash = true) {
		return async () => {
			this.props.startIndexation();
			await doScan(
				this.props.masterFolder,
				this.processFileWithHash(withHash),
				this.props.indexProgress,
				withHash
			);

			this.props.loadDatabase(this.props.masterFolder);

			this.props.endIndexation();
		};
	}

	render() {
		if (!this.props.dbLoaded) {
			return <LoaderCustom />;
		}
		return (
			<IndexationView
				index={this.startIndex(true)}
				quickIndex={this.startIndex(false)}
				goToScan={this.props.goToScan}
				goToAnalyzeDb={this.props.goToAnalyzeDb}
				goToHome={this.props.goToHome}
			/>
		);
	}
}

function mapStateToProps(state) {
	return {
		masterFolder: state.foldersState.masterPath,
		dbLoaded: state.indexationState.dbLoaded
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			createDatabase,
			indexDuplicate,
			startIndexation,
			loadDatabase,
			endIndexation,
			indexProgress,
			goToScan: () => push(routes.scan),
			goToAnalyzeDb: () => push(routes.analyzeDb),
			goToHome: () => push(routes.base)
		},
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(IndexationContainer);
