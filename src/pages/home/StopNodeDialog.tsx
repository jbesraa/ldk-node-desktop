import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { Backdrop, Button } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { useNodeContext } from "../../state/NodeContext";
import { Snackbar } from "../../common";
import { useState } from "react";

interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
	walletName: string;
	switchUpdate: () => void;
}

function StopNodeDialog(props: SimpleDialogProps) {
	const { stop_node } = useNodeContext();
	const { onClose, selectedValue, open, walletName, switchUpdate} = props;
	const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);
	const [isBackdropOpen, setIsBackdropOpen] = useState(false);
	const title = "Stop Node";

	const handleClose = () => {
		onClose(selectedValue);
	};

	const stopNode = async () => {
		if (!walletName) {
			console.log("wallet name is missing, stop node dialog");
			return;
		}
		setIsBackdropOpen(true);
		const success = await stop_node(walletName);
		if (!success) {
			setIsOpenSnackbar(true);
			setIsBackdropOpen(false);
		} else {
			// RELOAD NODE DATA
			switchUpdate();
			setTimeout(() => {}, 5000);
			setIsBackdropOpen(false);
		}
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="lg"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>
				{title}
			</DialogTitle>
			<Button color="warning" onClick={stopNode}>
				Stop Node
			</Button>
			<Snackbar
				message={"Stopping node failed"}
				open={isOpenSnackbar}
				setOpen={setIsOpenSnackbar}
			/>
			<Backdrop
				sx={{
					color: "#fff",
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={isBackdropOpen}
			>
				<SyncIcon fontSize="large" color="inherit" />
				<p style={{ textAlign: "center" }}>Stopping Node</p>
			</Backdrop>
		</Dialog>
	);
}

export default StopNodeDialog;
