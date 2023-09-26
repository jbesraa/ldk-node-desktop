import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import { invoke } from "@tauri-apps/api/tauri";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { ListItemIcon, ListItemText } from "@mui/material";
import { Snackbar } from "../../common";

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

function OpenChannelDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open } = props;
	const [peer_node_id, setPeerNode] = React.useState("");
	const [peer_net_address, setPeerNetAddress] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [channel_amount_sats, setChannelAmountSats] =
		React.useState(0);
	const [push_to_counterparty_msat, setPushToCounterpartyMsat] =
		React.useState(2000);
	const [announce_channel, setAnnounceChannel] =
		React.useState(false);
	const [isSnackbarOpen, setIssnackbarOpen] = React.useState(false);

	async function open_channel() {
		try {
			let res: boolean = await invoke("open_channel", {
				nodeId: peer_node_id,
				netAddress: peer_net_address,
				channelAmountSats: channel_amount_sats,
				pushToCounterpartyMsat: push_to_counterparty_msat,
				announceChannel: announce_channel,
			});
			if (res) {
				setMessage("Successfully connected to peer");
			}
			setMessage("Failed to connect to peer");
			setIssnackbarOpen(true);
			handleClose();
		} catch (e) {
			console.log(e);
			setMessage("Failed to connect to peer");
			setIssnackbarOpen(true);
		}
	}

	const title = "Open Channel";

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
					<TextField
						value={channel_amount_sats}
						onChange={(e) =>
							setChannelAmountSats(
								Number(e.target.value)
							)
						}
						style={{ width: "100%" }}
						label="Channel Amount (Sats)"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={push_to_counterparty_msat}
						onChange={(e) =>
							setPushToCounterpartyMsat(
								Number(e.target.value)
							)
						}
						style={{ width: "100%" }}
						label="Push to Counterparty (MSats)"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<ListItemText>Announce Channel</ListItemText>
					<ListItemIcon>
						<Checkbox
							checked={announce_channel}
							onChange={() =>
								setAnnounceChannel(!announce_channel)
							}
						/>
					</ListItemIcon>
				</ListItem>
				<ListItem disableGutters>
					<Button
						style={buttonStyle}
						variant="contained"
						onClick={open_channel}
					>
						Open
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

export default OpenChannelDialog;
