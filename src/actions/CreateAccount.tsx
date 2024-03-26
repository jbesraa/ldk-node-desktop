import { invoke } from "@tauri-apps/api/tauri";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import { info } from "tauri-plugin-log-api";
import { TextField } from "@mui/material";
import { GlobalButton, Snackbar } from "../common";

export interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
	walletName: string;
}

function CreateAccountDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open, walletName } = props;
	const [message, setMessage] = useState("");
	const [accountName, setAccountName] = useState("");
	const [accountToken, setAccountToken] = useState("");
	const [isSnackbarOpen, setIssnackbarOpen] = useState(false);

	async function create_account() {
		try {
			let res: string = await invoke("create_account", {
				name: accountName,
				nodeName: walletName
			});
			if (res) {
				setMessage("Successfully opened channel");
				setAccountToken(res)
			}
			setMessage("Failed to open channel");
		} catch (e) {
			info(`open_channel: ${String(e)}`);
			console.log(e);
			setMessage("Failed to open channel");
			setIssnackbarOpen(true);
		}
	}

	const title = "Create Account";

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
						style={{ width: "100%" }}
						label={"Account Name"}
						value={accountName}
						onChange={(e) => setAccountName(e.target.value)}
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						disabled={true}
						style={{ width: "100%" }}
						label={"Token"}
						value={accountToken}
					/>
				</ListItem>
				<ListItem disableGutters>
					<GlobalButton onClick={create_account} title="Send" />
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

export default CreateAccountDialog;

//
// - Create Account
//   - Through the Desktop APP
// - Create BOLT12 Offer with Account Name as Description
//   - Create JWT for the account
//
// - Receive Payment
// - Send Payment
// - List Transactions
//
//
//
//
//
