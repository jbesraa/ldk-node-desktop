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

function ConnectToPeerDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open, walletName } = props;
	const [peer_node_id, setPeerNode] = React.useState("");
	const [peer_net_address, setPeerNetAddress] =
		React.useState("0.0.0.0:9733");
	const [message, setMessage] = React.useState("");
	const [isSnackbarOpen, setIssnackbarOpen] = React.useState(false);

	async function connect_to_peer() {
		try {
			const data = {
				ourNodeName: walletName,
				nodeId: peer_node_id,
				netAddress: peer_net_address,
			};
			if (
				!data.ourNodeName ||
				!data.nodeId ||
				!data.netAddress
			) {
				return;
			}
			let res = await invoke("connect_to_node", {
				...data,
			});
			if (res) {
				setMessage("Successfully connected to peer");
			}
			setMessage(String(res));
			setIssnackbarOpen(true);
			// handleClose();
		} catch (e) {
			console.log(e);
			setMessage(String(e));
			setIssnackbarOpen(true);
		}
	}

	React.useEffect(() => {
		return () => setIssnackbarOpen(false);
	}, []);

	const title = "Connect To Peer";

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
						value={peer_node_id}
						onChange={(e) => setPeerNode(e.target.value)}
						style={{ width: "100%" }}
						label="Peer Node Id"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={peer_net_address}
						onChange={(e) =>
							setPeerNetAddress(e.target.value)
						}
						style={{ width: "100%" }}
						label="Peer Net Address"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
				<GlobalButton onClick={connect_to_peer} title="Connect" />
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

export default ConnectToPeerDialog;
