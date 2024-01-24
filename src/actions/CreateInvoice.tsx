import * as React from "react";
import { invoke } from "@tauri-apps/api/tauri";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { Snackbar } from "../common";

const buttonStyle = {
	color: "#344e41",
	fontSize: "1em",
	width: "100%",
	fontWeight: "600",
	backgroundColor: "#a3b18a",
};

export interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
}

function CreateInvoiceDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open } = props;
	const [message, setMessage] = React.useState("");
	const [amount_msat, setAmountMSat] = React.useState(0);
	const [expiry_secs, setExpirySecs] = React.useState(0);
	const [description, setDescription] = React.useState("");
	const [isSnackbarOpen, setIssnackbarOpen] = React.useState(false);

	async function create_invoice() {
		try {
			let res = await invoke("create_invoice", {
				amount_msat,
				description,
				expiry_secs,
			});
			if (res) {
				setMessage("Successfully created invoice");
			}
			setMessage("Failed to create invoice");
			setIssnackbarOpen(true);
			handleClose();
		} catch (e) {
			console.log(e);
			setMessage("Failed to create invoice");
			setIssnackbarOpen(true);
		}
	}

	const title = "Create (Bolt11) Invoice";

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
			<DialogTitle sx={{ textAlign: "center" }}>
				{title}
			</DialogTitle>
			<List sx={{ p: 6 }}>
				<ListItem disableGutters>
					<TextField
						value={amount_msat}
						onChange={(e) =>
							setAmountMSat(Number(e.target.value))
						}
						style={{ width: "100%" }}
						label="Amount (msat)"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={expiry_secs}
						onChange={(e) =>
							setExpirySecs(Number(e.target.value))
						}
						style={{ width: "100%" }}
						label="Expiry (secs)"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={description}
						onChange={(e) =>
							setDescription(e.target.value)
						}
						style={{ width: "100%" }}
						label="Description"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<Button
						style={buttonStyle}
						variant="contained"
						onClick={create_invoice}
					>
						Create
					</Button>
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

export default CreateInvoiceDialog;
