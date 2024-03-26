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

function OpenLSPChannelDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open, walletName } = props;
	const [message, setMessage] = useState("");
	const [channel_amount_sats, setChannelAmountSats] = useState(100000);
	const [bolt11Invoice, setBolt11Invoice] = useState("");
	const [LSPNetworkAddress] = useState("44.219.111.31:39735");
	const [LSPNodeId] = useState(
		"0371d6fd7d75de2d0372d03ea00e8bacdacb50c27d0eaea0a76a0622eff1f5ef2b"
	);
	const [isSnackbarOpen, setIssnackbarOpen] = useState(false);

	async function open_channel() {
		try {
			let res: string = await invoke("open_channel_with_lsp", {
				nodeName: walletName,
				amountMsat: channel_amount_sats * 1000,
				announceChannel: true,
			});
			if (res) {
				setMessage("Successfully opened channel");
				setBolt11Invoice(res);
			}
			setMessage("Failed to open channel");
			// setIssnackbarOpen(true);
			// handleClose();
		} catch (e) {
			info(`open_channel: ${String(e)}`);
			console.log(e);
			setMessage("Failed to open channel");
			setIssnackbarOpen(true);
		}
	}
	const title = "Open Channel With LSP";

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
						disabled={true}
						style={{ width: "100%" }}
						label={"Provider"}
						value={"C="}
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						disabled={true}
						style={{ width: "100%" }}
						label={"LSP Node ID"}
						value={LSPNodeId}
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						disabled={true}
						style={{ width: "100%" }}
						label={"Network Address"}
						value={LSPNetworkAddress}
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						label="Channel Amount (Sats)"
						style={{ width: "100%" }}
						value={channel_amount_sats}
						onChange={(e) =>
							setChannelAmountSats(Number(e.target.value))
						}
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						label="Invoice To Pay"
						style={{ width: "100%" }}
						value={bolt11Invoice}
					/>
				</ListItem>
				<ListItem disableGutters>
					<GlobalButton onClick={open_channel} title="Send" />
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

export default OpenLSPChannelDialog;
