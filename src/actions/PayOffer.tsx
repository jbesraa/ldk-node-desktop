import * as React from "react";
import { invoke } from "@tauri-apps/api/tauri";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { GlobalButton, Snackbar } from "../common";

export interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
	walletName: string;
}

function PayInvoiceDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open, walletName } = props;
	const [message, setMessage] = React.useState("");
	const [offer, setOffer] = React.useState("");
	const [isSnackbarOpen, setIssnackbarOpen] = React.useState(false);

	async function pay_offer() {
		try {
			let res = await invoke("pay_bolt12_offer", {
				offer,
				nodeName: walletName,
				amountMsat: 10*1000
			});
				console.log(res);
			if (res) {
				setMessage("Successfully Paid Offer");
			}
		} catch (e) {
			console.log(e);
			setMessage("Failed to pay invoice");
			setIssnackbarOpen(true);
		}
	}

	const title = "Pay an Offer";

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
						value={offer}
						onChange={(e) => setOffer(e.target.value)}
						style={{ width: "100%" }}
						label="Offer"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={10*1000}
						style={{ width: "100%" }}
						label="Amount"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<GlobalButton onClick={pay_offer} title="Send" />
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

export default PayInvoiceDialog;
