import React, { useEffect } from "react";
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

const IndexationContainer = props => {
	const {
		masterFolder,
		dbSize,
		indexing,
		isIndexed,
		step,
		progress,
		folderProgress,
		duplicates,
		goToScan,
		goToAnalyzeDb,
		goToHome,
		dbLoaded,
		createDatabase,
		startIndexation,
		indexDuplicate,
		indexProgress,
		loadDatabase,
		endIndexation
	} = props;
	useEffect(() => {
		if (masterFolder) {
			createDatabase(masterFolder);
			return () => {};
		}
	}, [masterFolder, createDatabase]);

	if (!dbLoaded) {
		return <LoaderCustom />;
	}

	const startIndex = withHash => async () => {
		startIndexation();
		await doScan(
			masterFolder,
			processFileWithHash(withHash, masterFolder, indexDuplicate),
			indexProgress,
			withHash
		);

		loadDatabase(masterFolder);

		endIndexation();
	};

	return (
		<IndexationView
			index={startIndex(true)}
			quickIndex={startIndex(false)}
			masterFolder={masterFolder}
			dbSize={dbSize}
			indexing={indexing}
			isIndexed={isIndexed}
			step={step}
			progress={progress}
			folderProgress={folderProgress}
			duplicates={duplicates}
			goToScan={goToScan}
			goToAnalyzeDb={goToAnalyzeDb}
			goToHome={goToHome}
		/>
	);
};

function mapStateToProps(state) {
	return {
		masterFolder: state.foldersState.masterPath,
		dbLoaded: state.indexationState.dbLoaded,
		dbSize: state.indexationState.dbSize,
		indexing: state.indexationState.indexing,
		isIndexed: state.indexationState.isIndexed,
		step: state.indexationState.step,
		progress: state.indexationState.progress,
		folderProgress: state.indexationState.folderProgress,
		duplicates: state.indexationState.duplicates
	};
}

const processFileWithHash = (hashComputed, masterFolder, indexDuplicate) => async fileProps => {
	const occurences = await findDb(masterFolder, { relpath: fileProps.relpath }, FilePropsDb);
	if (occurences.length) {
		if (occurences.length > 1) {
			console.error(
				`More than 1 occurence for relpath ${fileProps.relpath}!! This should never happen! Will only compare to the first one...`
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
			indexDuplicate(occurences[0], fileProps, diff);
			await updateDb(masterFolder, occurences[0].cloneFromSamePath(fileProps));
		}
	} else {
		if (!hashComputed) {
			await fileProps.computeHash();
			console.info("Adding new file in db", fileProps);
			indexDuplicate(undefined, fileProps, new Set(["new"]));
		}
		await insertDb(masterFolder, fileProps.toFilePropsDb());
	}
};

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
