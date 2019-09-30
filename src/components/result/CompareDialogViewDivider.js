import React from "react";
import { Label } from "semantic-ui-react";

const CompareDialogView = ({ topLabel, bottomLabel }) => (
	<div style={inlineStyle.divider}>
		<div style={inlineStyle.dividerLine} />
		<Label basic color="grey" pointing="left" style={inlineStyle.dividerLabelTop}>
			{topLabel}
		</Label>
		<Label basic color="grey" pointing="right" style={inlineStyle.dividerLabel}>
			{bottomLabel}
		</Label>
		<div style={inlineStyle.dividerLine} />
	</div>
);

const inlineStyle = {
	divider: {
		flex: "0 1",
		margin: "1rem auto",
		textAlign: "center",
		color: "black"
	},
	dividerLine: {
		borderLeft: "1px solid rgba(34, 36, 38, 0.15)",
		borderRight: "1px solid rgba(255, 255, 255, 0.1)",
		height: "calc(50% - 2.5em)",
		width: 0,
		display: "inline-block"
	},
	dividerLabel: {
		display: "block",
		margin: "0.4em"
	},
	dividerLabelTop: {
		display: "block",
		margin: "0.4em",
		marginTop: 0
	}
};

export default CompareDialogView;
