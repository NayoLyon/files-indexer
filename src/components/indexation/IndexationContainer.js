import React, { useState, useEffect, useContext } from "react";
import { connect } from "react-redux";

import SourceContext from "../source/SourceContext";
import { doScan, FilePropsDb } from "../../api/filesystem";
import { push } from "../../modules/router/routerActions";

import routes from "../../utils/routes";

import LoaderCustom from "../shared/LoaderCustom";
import IndexationView from "./IndexationView";

const IndexationContainer = ({ goToScan, goToAnalyzeDb, goToHome }) => {
	const db = useContext(SourceContext);
	const [dbLoaded, setDbLoaded] = useState(false);
	const [dbSize, setDbSize] = useState(-1);
	const [isIndexed, setIndexed] = useState(false);
	useEffect(() => {
		setDbLoaded(false);
		setDbSize(-1);
		if (db) {
			let canceled = false;
			const doLoadDb = async () => {
				const dbSize = await db.getSize();
				if (!canceled) {
					setDbLoaded(true);
					setDbSize(dbSize);
					setIndexed(dbSize > 0);
				}
			};
			doLoadDb();
			return () => (canceled = true);
		}
	}, [db]);
	const [indexing, setIndexing] = useState(false);
	const [progressState, setProgress] = useState({
		step: "",
		progress: { percent: 0 },
		folderProgress: ""
	});
	const [duplicates, setDuplicates] = useState(new Map());

	// Caution: startIndex is a function, so to update it we have to escape the function mode of setState of Hooks
	// => setStartIndexFunc and useState can either take the state itself, or a function updater
	// useState: for lazy initial state
	// setStartIndexFunc: function to merge updated object
	const [startIndex, setStartIndexFunc] = useState(() => () => {});
	useEffect(() => {
		if (dbLoaded) {
			let canceled = false;
			const masterFolder = db ? db.folder : "";
			const duplicatesMap = new Map();
			const startIndexation = () => {
				if (canceled) return; // Component has changed, stop now...

				setIndexed(false);
				setIndexing(true);
				setProgress({
					step: "",
					progress: { percent: 0 },
					folderProgress: ""
				});
			};
			const endIndexation = dbSize => {
				if (canceled) return; // Component has changed, stop now...

				setDbSize(dbSize);
				setIndexed(dbSize > 0);
				setDuplicates(duplicatesMap);
				setIndexing(false);
				setProgress(progressState => ({ ...progressState, folderProgress: "" }));
			};
			const indexProgress = (step, progress, folderProgress) => {
				if (canceled) return; // Component has changed, stop now...

				setProgress(progressState => {
					if (progressState.step === step) {
						// Avoid too much re-render...
						const stateProgress = progressState.progress.total
							? (progressState.progress.value / progressState.progress.total) * 100
							: progressState.progress.percent;
						const actionProgress = progress.total
							? (progress.value / progress.total) * 100
							: progress.percent;
						if (Math.round(100 * stateProgress) === Math.round(100 * actionProgress)) {
							return progressState;
						}
					}
					return {
						step,
						progress: progress.total
							? progress
							: { percent: Math.round(100 * progress.percent) / 100 },
						folderProgress
					};
				});
			};
			const indexDuplicate = (dbFile, newFile, diff) => {
				duplicatesMap.set(newFile.relpath, {
					dbFile,
					file: newFile,
					diff
				});
			};
			setStartIndexFunc(() => withHash => async () => {
				startIndexation();
				await doScan(
					masterFolder,
					processFileWithHash(db, withHash, indexDuplicate),
					indexProgress,
					withHash,
					() => canceled
				);

				const dbSize = await db.getSize();

				endIndexation(dbSize);
			});
			return () => (canceled = true);
		} else {
			setStartIndexFunc(() => () => {});
		}
	}, [db, dbLoaded]);

	if (!dbLoaded) {
		return <LoaderCustom />;
	}

	const { step, progress, folderProgress } = progressState;
	return (
		<IndexationView
			index={startIndex(true)}
			quickIndex={startIndex(false)}
			masterFolder={(db && db.folder) || ""}
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

const processFileWithHash = (db, hashComputed, indexDuplicate) => async fileProps => {
	if (!db) {
		// Should not happen...
		throw new Error("Cannot process file when db not opened!!");
	}
	const occurences = await db.find({ relpath: fileProps.relpath }, FilePropsDb);
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
				await fileProps.computeHash(db.folder);
				diff = fileProps.compareToSamePath(occurences[0]);
			}

			// Then update the db and log
			indexDuplicate(occurences[0], fileProps, diff);
			await db.updateDb(occurences[0].cloneFromSamePath(fileProps));
		}
	} else {
		if (!hashComputed) {
			await fileProps.computeHash(db.folder);
			console.info("Adding new file in db", fileProps);
			indexDuplicate(undefined, fileProps, new Set(["new"]));
		}
		await db.insertDb(fileProps.toFilePropsDb());
	}
};

const mapDispatchToProps = dispatch => ({
	goToScan: () => dispatch(push(routes.scan)),
	goToAnalyzeDb: () => dispatch(push(routes.analyzeDb)),
	goToHome: () => dispatch(push(routes.base))
});

export default connect(
	null,
	mapDispatchToProps
)(IndexationContainer);
