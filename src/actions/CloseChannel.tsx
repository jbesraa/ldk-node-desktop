import { invoke } from "@tauri-apps/api/tauri";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useEffect, useState } from "react";
import { info } from "tauri-plugin-log-api";
import { ChannelDetails, PeerDetails } from "../types";
import { useNodeContext } from "../state/NodeContext";
import SelectComponent from "../common/SelectInput";
import { GlobalButton, Snackbar } from "../common";

export interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
	walletName: string;
}

function CloseChannelDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, walletName, open } = props;
	const [message, setMessage] = useState("");
	const [selectedPeerNodeId, setSelecterPeerNodeId] = useState("");
	const [selectedChannel, setSelectedChannel] = useState("");
	const [peersList, setPeersList] = useState<PeerDetails[]>([]);
	const [channelList, setChannelList] = useState<ChannelDetails[]>(
		[]
	);
	const [isSnackbarOpen, setIssnackbarOpen] = useState(false);
	const { list_channels, list_peers } = useNodeContext();

	useEffect(() => {
		const run = async () => {
			let res = await list_channels(walletName);
			setChannelList(res);
		};
		run();
	}, [list_channels]);

	useEffect(() => {
		const run = async () => {
			let res = await list_peers(walletName);
			setPeersList(res);
		};
		run();
	}, [list_channels]);

	async function close_channel() {
		try {
			const data = {
				nodeId: selectedPeerNodeId,
				channelId: Array.from(selectedChannel)
			};
			info(`data channel id: ${String(data.channelId)}`);
			let res: boolean = await invoke("close_channel", {
				...data,
			});
			info(`close_channel: ${String(res)}`);
			if (res) {
				setMessage("Successfully closed channel");
			}
			setMessage("Failed to close channel");
			setIssnackbarOpen(true);
			handleClose();
		} catch (e) {
			console.log(e);
			info(`close_channel error: ${String(e)}`);
			setMessage("Failed to close channel");
			setIssnackbarOpen(true);
		}
	}

	const title = "Close Channel";

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
							setSelecterPeerNodeId(e.target.value);
						}}
					/>
				</ListItem>
				<ListItem disableGutters>
					<SelectComponent
						title={"Channels"}
						items={channelList
							.filter(
								(c) => c.counterparty_node_id == selectedPeerNodeId
							)
							.map((c) => ({
								value: c.channel_id,
								title: c.channel_id,
							}))}
						selected={selectedChannel}
						handleChange={(e) => setSelectedChannel(e.target.value)}
					/>
				</ListItem>
				<ListItem disableGutters>
				<GlobalButton onClick={close_channel} title="Send" />
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

export default CloseChannelDialog;
