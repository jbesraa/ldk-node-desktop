import { invoke } from "@tauri-apps/api/tauri";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { Snackbar } from "../../../../common";
import { useEffect, useState } from "react";
import { useNodeContext } from "../../../../state/NodeContext";
import { ChannelDetails, PeerDetails } from "../../../../types";
import SelectComponent from "../../../../common/SelectInput";
import { info } from "tauri-plugin-log-api";
import {
	Checkbox,
	ListItemIcon,
	ListItemText,
	TextField,
} from "@mui/material";

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
	const [message, setMessage] = useState("");
	const [selectedPeerNodeId, setSelecterPeerNodeId] = useState("");
	const [selectedChannel, setSelectedChannel] = useState("");
	const [peersList, setPeersList] = useState<PeerDetails[]>([]);
	const [channelList, setChannelList] = useState<ChannelDetails[]>(
		[]
	);
	const [channel_amount_sats, setChannelAmountSats] = useState(0);
	const [isSnackbarOpen, setIssnackbarOpen] = useState(false);
	const { list_channels, list_peers } = useNodeContext();
	const [selectedPeerNetworkAddress, setSelectedPeerNetworkAddress] =
		useState("");
	const [announce_channel, setAnnounceChannel] = useState(false);
	useEffect(() => {
		const run = async () => {
			let res = await list_channels();
			setChannelList(res);
		};
		run();
	}, [list_channels]);

	useEffect(() => {
		const run = async () => {
			let res = await list_peers();
			setPeersList(res);
		};
		run();
	}, [list_channels]);

	async function open_channel() {
		try {
			let res: boolean = await invoke("open_channel", {
				nodeId: selectedPeerNodeId,
				netAddress: selectedPeerNetworkAddress,
				channelAmountSats: channel_amount_sats,
				pushToCounterpartyMsat: 0,
				announceChannel: announce_channel,
			});
			if (res) {
				setMessage("Successfully opened channel");
			}
			setMessage("Failed to open channel");
			setIssnackbarOpen(true);
			handleClose();
		} catch (e) {
			info(`open_channel: ${String(e)}`)
			console.log(e);
			setMessage("Failed to open channel");
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
			<DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>
			<List sx={{ p: 6 }}>
				<ListItem disableGutters>
					<SelectComponent
						title={"Peer Node ID"}
						items={peersList.map((c) => ({
							value: c.node_id,
							title: c.node_id,
						}))}
						selected={selectedPeerNodeId}
						handleChange={(e) => {
							const peer = peersList.find(
								(p) => p.node_id == e.target.value
							);
							if (peer) {
								setSelectedPeerNetworkAddress(peer.address);
								setSelecterPeerNodeId(e.target.value);
							}
						}}
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						disabled={true}
						style={{ width: "100%" } }
						label={"Peer Network Address"}
						value={selectedPeerNetworkAddress}
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						label="Channel Amount (Sats)"
						style={{ width: "100%" } }
						value={channel_amount_sats}
						onChange={(e) =>
							setChannelAmountSats(Number(e.target.value))
						}
					/>
				</ListItem>
				<ListItemText>Announce Channel</ListItemText>
				<ListItemIcon>
					<Checkbox
						checked={announce_channel}
						onChange={() => setAnnounceChannel(!announce_channel)}
					/>
				</ListItemIcon>
				<ListItem disableGutters>
					<Button
						style={buttonStyle}
						variant="contained"
						onClick={open_channel}
					>
						Send
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
