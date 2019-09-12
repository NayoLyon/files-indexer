import React from "react";
import { Table } from "semantic-ui-react";

import { printValue } from "../../utils/format";

const IndexationAnomaliesDuplicate = ({ dupFile: { dbFile, file, diff }, relpath }) =>
	Array.from(diff).map((prop, index) => (
		<Table.Row key={`${relpath}_${prop}`}>
			{index === 0 && (
				<Table.Cell textAlign="center" rowSpan={diff.size}>
					{relpath}
				</Table.Cell>
			)}
			<Table.Cell textAlign="center">{prop}</Table.Cell>
			<Table.Cell textAlign="center">
				{prop === "new" ? null : printValue(file, prop)}
			</Table.Cell>
			<Table.Cell textAlign="center">
				{prop === "new" ? null : printValue(dbFile, prop)}
			</Table.Cell>
		</Table.Row>
	));

const IndexationAnomaliesView = ({ duplicates }) => {
	const duplicatesRows = [];
	duplicates.forEach((dupFile, relpath) => {
		duplicatesRows.push(
			<IndexationAnomaliesDuplicate key={relpath} dupFile={dupFile} relpath={relpath} />
		);
	});

	return duplicates.size === 0 ? null : (
		<Table>
			<Table.Body>{duplicatesRows}</Table.Body>
		</Table>
	);
};

export default IndexationAnomaliesView;
