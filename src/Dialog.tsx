import * as React from "react";
import Button from "@mui/material/Button";

const buttonStyle = {
	color: "#344e41",
	fontSize: "0.8em",
	width: "100%",
	fontWeight: "600",
	backgroundColor: "#a3b18a",
};

export default function DialogWindow({
	DialogView,
	buttonTitle,
}: {
	DialogView: any;
	buttonTitle: string;
}) {
	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<Button
				style={buttonStyle}
				variant="outlined"
				onClick={handleClickOpen}
			>
				{buttonTitle}
			</Button>
			<DialogView
				open={open}
				onClose={handleClose}
			/>
		</>
	);
}
