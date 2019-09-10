const { remote } = window.require("electron");
const Store = remote.require("electron-store");

export const SELECT_MASTER_FOLDER = "SELECT_MASTER_FOLDER";
export const SELECT_TOSCAN_FOLDER = "SELECT_TOSCAN_FOLDER";

export function loadConfig() {
	return async dispatch => {
		const configStore = new Store();
		const masterFolder = configStore.get("masterFolder");
		const toScanFolder = configStore.get("toScanFolder");
		dispatch({
			type: SELECT_MASTER_FOLDER,
			path: masterFolder
		});
		dispatch({
			type: SELECT_TOSCAN_FOLDER,
			path: toScanFolder
		});
	};
}
export function selectMaster(folderPath) {
	const configStore = new Store();
	configStore.set("masterFolder", folderPath);
	return {
		type: SELECT_MASTER_FOLDER,
		path: folderPath
	};
}

export function selectToScan(folderPath) {
	const configStore = new Store();
	configStore.set("toScanFolder", folderPath);
	return {
		type: SELECT_TOSCAN_FOLDER,
		path: folderPath
	};
}
