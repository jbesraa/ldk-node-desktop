import { useState } from "react";
import Button from "@mui/material/Button";
import { IconButton } from "@mui/material";

const buttonStyle = {
	color: "#344e41",
	// fontWeight: "600",
	// backgroundColor: "#a3b18a",
};

function DialogWindow({
	DialogView,
	buttonTitle,
	style,
	onCloseHandler,
	extraProps,
	ButtonIcon,
}: {
	DialogView: any;
	buttonTitle: string;
	style?: any;
	onCloseHandler?: any;
	extraProps?: any;
	ButtonIcon?: any;
}) {
	const [open, setOpen] = useState(false);
	const handleClickOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		onCloseHandler && onCloseHandler();
		setOpen(false);
	};

	return (
		<>
			{ButtonIcon ? (
				<IconButton onClick={handleClickOpen}>
					{ButtonIcon}
				</IconButton>
			) : (
				<Button
					size="large"
					style={style ? style : buttonStyle}
					onClick={handleClickOpen}
				>
					{buttonTitle}
				</Button>
			)}
			<DialogView
				open={open}
				onClose={handleClose}
				{...extraProps}
			/>
		</>
	);
}

export default DialogWindow;
