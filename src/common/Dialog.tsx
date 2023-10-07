import { useState } from "react";
import Button from "@mui/material/Button";

const buttonStyle = {
	color: "#344e41",
	// fontWeight: "600",
	// backgroundColor: "#a3b18a",
};

function DialogWindow({
	DialogView,
	buttonTitle,
	style,
}: {
	DialogView: any;
	buttonTitle: string;
	style?: any;
}) {
	const [open, setOpen] = useState(false);
	const handleClickOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<Button
				style={style ? style : buttonStyle}
				variant="outlined"
				onClick={handleClickOpen}
			>
				{buttonTitle}
			</Button>
			<DialogView open={open} onClose={handleClose} />
		</>
	);
}

export default DialogWindow;
