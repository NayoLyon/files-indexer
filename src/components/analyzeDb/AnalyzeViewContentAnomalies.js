import React from "react";
import { Tab } from "semantic-ui-react";

import MissingTab from "./MissingTab";
import DuplicateTab from "./DuplicateTab";

const AnalyzeViewContentAnomalies = ({
	missingList,
	duplicateList,
	openDbFolderFor,
	removeInDb,
	removeFile
}) => {
	const panes = [];
	if (missingList.length > 0) {
		panes.push({
			menuItem: `Missing (${missingList.length})`,
			render: () => (
				<MissingTab
					files={missingList}
					openDbFolderFor={openDbFolderFor}
					removeInDb={removeInDb}
				/>
			)
		});
	}
	if (duplicateList.size > 0) {
		panes.push({
			menuItem: `Duplicates (${duplicateList.size})`,
			render: () => (
				<DuplicateTab
					files={duplicateList}
					openDbFolderFor={openDbFolderFor}
					removeFile={removeFile}
				/>
			)
		});
	}
	return missingList.length || duplicateList.size ? (
		<Tab style={{ height: "100%" }} panes={panes} />
	) : (
		<p key="noErrors">No errors found in db.</p>
	);
};

export default AnalyzeViewContentAnomalies;
