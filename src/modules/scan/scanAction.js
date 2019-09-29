export const SCAN_START = "SCAN_START";
export const SCAN_END = "SCAN_END";
export const SCAN_PROGRESS = "SCAN_PROGRESS";
export const SCAN_RESET = "SCAN_RESET";

export function startScan() {
	return {
		type: SCAN_START
	};
}

export function endScan() {
	return {
		type: SCAN_END
	};
}

export function resetScan() {
	return {
		type: SCAN_RESET
	};
}

export function scanProgress(step, progress, file) {
	return {
		type: SCAN_PROGRESS,
		step,
		progress,
		file
	};
}
