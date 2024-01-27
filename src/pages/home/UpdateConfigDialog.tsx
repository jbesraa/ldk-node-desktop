import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useNodeContext } from "../../state/NodeContext";
import { useEffect, useState } from "react";
import { UpdateConfigInput } from "../../types";
import { GlobalButton, Snackbar } from "../../common";

interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	walletName: string;
	onClose: (value: string) => void;
}

function UpdateConfigDialog(props: SimpleDialogProps) {
	const { update_config } = useNodeContext();
	const { onClose, selectedValue, open, walletName } = props;
	const [message, setMessage] = useState("");
	const [listeningAddress, setListeningAddress] =
		useState("0.0.0.0:9735");
	const [esploraAddress, setEsploraAddress] = useState(
		"https://5b9c-46-116-218-230.ngrok-free.app"
	);
	const [isSnackbarOpen, setIssnackbarOpen] = useState(false);

	const update = async () => {
		const input: UpdateConfigInput = {
			walletName, 
			listeningAddress,
			esploraAddress,
		};
			console.log(input);
		const res = await update_config(input);
		if(res) {
			setMessage("Updated values successfully");
			setIssnackbarOpen(true);
		} else {
			setMessage("Failed to update values");
			setIssnackbarOpen(true);
		}
	} 
	useEffect(() => {
		return () => setIssnackbarOpen(false);
	}, []);

	const title = "Update Config";

	const handleClose = () => {
		onClose(selectedValue);
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="lg"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>
			<List sx={{ p: 6 }}>
				<ListItem disableGutters>
					<TextField
						value={listeningAddress}
						onChange={(e) => setListeningAddress(e.target.value)}
						style={{ width: "100%" }}
						label="Listening Address"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={esploraAddress}
						onChange={(e) => setEsploraAddress(e.target.value)}
						style={{ width: "100%" }}
						label="Esplora Address"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
				<GlobalButton
					onClick={update}
					title={"Update"}
				/>
		
					<Snackbar
						message={message}
						open={isSnackbarOpen}
						setOpen={setIssnackbarOpen}
					/>
				</ListItem>
			</List>
		</Dialog>
	);
}

export default UpdateConfigDialog;


