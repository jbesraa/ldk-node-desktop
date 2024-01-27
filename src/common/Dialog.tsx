import { useState } from "react";
import { IconButton } from "@mui/material";
import GlobalButton from "./Button";

function DialogWindow({
	DialogView,
	buttonTitle,
	style,
	onCloseHandler,
	extraProps,
	ButtonIcon,
	TitleButton,
}: {
	DialogView: any;
	buttonTitle: string;
	style?: any;
	onCloseHandler?: any;
	extraProps?: any;
	ButtonIcon?: any;
	TitleButton?: any;
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
			) : TitleButton ? (
				<TitleButton onClick={handleClickOpen} />
			) : (
				<GlobalButton
					style={style}
					onClick={handleClickOpen}
					title={buttonTitle}
				/>
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
