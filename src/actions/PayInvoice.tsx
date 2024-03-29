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
}

function PayInvoiceDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open } = props;
	const [ message, setMessage ] = React.useState("");
	const [invoice, setInvoice] = React.useState("");
	const [isSnackbarOpen, setIssnackbarOpen] = React.useState(false);

	async function pay_invoice() {
		try {
			let res = await invoke("pay_invoice", {
				invoice,
			});
			if (res) {
				setMessage("Successfully Paid Invoice");
			}
			setMessage("Failed to pay invoice");
			setIssnackbarOpen(true)
			handleClose();
		} catch (e) {
			console.log(e);
			setMessage("Failed to pay invoice");
			setIssnackbarOpen(true)
		}
	}

	const title = "Pay (Bolt11) Invoice";

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
						value={invoice}
						onChange={(e) => setInvoice(e.target.value)}
						style={{ width: "100%" }}
						label="Invoice"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
				<GlobalButton onClick={pay_invoice} title="Send" />
					<Snackbar message={message} open={isSnackbarOpen} setOpen={setIssnackbarOpen} />
				</ListItem>
			</List>
		</Dialog>
	);
}

export default PayInvoiceDialog;

