const { remote } = window.require("electron");

const fs = remote.require("fs");

export async function readNDJsonFile(file) {
	const loadFile = new Promise((resolve, reject) => {
		fs.readFile(file, "utf8", (err, data) => {
			if (err) {
				reject(err);
			}

			resolve(data.trim().split(/\r?\n/));
		});
	});
	const fileContent = await loadFile;
	const objectsList = fileContent.map(JSON.parse);

	return objectsList;
}
export function writeNDJsonFile(objectsList, file) {
	let fileContent = "";
	objectsList.forEach(obj => {
		fileContent += JSON.stringify(obj) + "\n";
	});
	fs.writeFileSync(file, fileContent);
}
