import filesize from "filesize";

const size = filesize.partial({ standard: "iec", separator: "," });

// For date formatting: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/DateTimeFormat
export function printValue(obj, prop) {
	const val = obj[prop];
	if (val instanceof Date) {
		return val.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
	} else if (prop === "size") {
		return size(val);
	} else if (prop.endsWith("Ms")) {
		return new Date(val).toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
	}
	return `${val}`;
}

export function dummy() {
	// To avoid eslint error...
}
