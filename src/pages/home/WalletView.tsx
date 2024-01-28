import {
	Backdrop,
	Card,
	CardContent,
	Divider,
	IconButton,
	Tooltip,
	Typography,
	styled,
} from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { useEffect, useState } from "react";
import { useNodeContext } from "../../state/NodeContext";
import MenuButton from "../../common/MenuButton";
import {
	ChannelDetails,
	PeerDetails,
	TablePeerDetails,
} from "../../types";
import Stepper from "../../common/carousle";
import { writeText } from "@tauri-apps/api/clipboard";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DataSaverOnIcon from "@mui/icons-material/DataSaverOn";
import PublicIcon from "@mui/icons-material/Public";
import FlagIcon from "@mui/icons-material/Flag";
import { Snackbar } from "../../common";

export interface WalletData {
	name: string;
}

interface SectionTitleProps {
	title: string;
	onClick: any;
	disabled?: boolean;
}

interface SectionTitleInfoProps {
	nodeName: string;
	isRunning: boolean;
	isFold: boolean;
	isLoading?: boolean;
	switchUpdate: () => void;
}

interface DataCardProps {
	title: string;
	value: string;
}

const DataCard = (props: DataCardProps) => {
	const { title, value } = props;
	return (
		<Card
			onClick={() => writeText(value)}
			sx={{
				boxShadow: "none",
				backgroundColor: "inherit",
				paddingLeft: "0.5em",
			}}
		>
			<CardContent>
				<Typography variant="subtitle2" color="gray">
					{title}
				</Typography>
				<Typography variant="subtitle1" color="primary">
					{value}
				</Typography>
			</CardContent>
		</Card>
	);
};

interface ChannelCardProps {
	channel: ChannelDetails;
}

const ChannelCard = (props: ChannelCardProps) => {
	const { channel } = props;

	return (
		<Card
			sx={{
				backgroundColor: "inherit",
				maxHeight: "10vh",
				boxShadow: "none",
				borderRight: "1px dashed #52796f",
			}}
		>
			<CardContent style={{ display: "grid" }}>
				<Typography
					variant="subtitle2"
					color="black"
					style={{
						textAlign: "left",
						cursor: "pointer",
					}}
					onClick={() => writeText(channel.channel_id)}
				>
					ID
					{channel.channel_id
						? ` ${channel.channel_id.slice(
								0,
								5
						  )}..${channel.channel_id.slice(-6)} `
						: "-"}
				</Typography>
				<Typography
					variant="subtitle2"
					style={{
						paddingTop: "0.1em",
					}}
					color={"black"}
				>
					Balance {channel.balance_msat}
				</Typography>
				<div
					style={{
						justifySelf: "right",
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr",
						gap: "1em",
					}}
				>
					<Tooltip
						title={
							channel.is_usable
								? "Channel is usable"
								: "Channel not usable"
						}
					>
						<FlagIcon
							color={
								channel.is_usable
									? "success"
									: "error"
							}
						/>
					</Tooltip>
					<Tooltip
						title={
							channel.is_public
								? "Channel is public"
								: "Channel is not public"
						}
					>
						<PublicIcon
							color={
								channel.is_public
									? "success"
									: "error"
							}
						/>
					</Tooltip>
					<Tooltip
						style={{
							justifySelf: "right",
						}}
						title="Actions"
					>
						<MoreVertIcon
							color="disabled"
							style={{
								cursor: "pointer",
							}}
						/>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
};

interface PeerCardProps {
	peer: TablePeerDetails;
}

const PeerCard = (props: PeerCardProps) => {
	const { peer } = props;

	return (
		<Card
			sx={{
				backgroundColor: "inherit",
				maxHeight: "10vh",
				boxShadow: "none",
				borderRight: "1px dashed #52796f",
			}}
		>
			<CardContent style={{ display: "grid" }}>
				<Typography
					variant="subtitle2"
					color="black"
					style={{
						textAlign: "left",
						cursor: "pointer",
					}}
					onClick={() => writeText(peer.node_id)}
				>
					Node ID
					{peer.node_id
						? ` ${peer.node_id.slice(
								0,
								5
						  )}..${peer.node_id.slice(-6)} `
						: "-"}
				</Typography>
				<Typography
					variant="subtitle2"
					style={{
						paddingTop: "0.1em",
					}}
					color={"black"}
				>
					Network Address
					{peer.address}
				</Typography>
				<div
					style={{
						justifySelf: "right",
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr",
						gap: "1em",
					}}
				>
					<Tooltip
						title={
							peer.is_connected
								? "Peer is online"
								: "Peer is offline"
						}
					>
						<ConnectWithoutContactIcon
							color={
								peer.is_connected
									? "success"
									: "error"
							}
						/>
					</Tooltip>
					<Tooltip
						title={
							peer.is_persisted
								? "Peer is persisted"
								: "Peer is not persisted"
						}
					>
						<DataSaverOnIcon
							color={
								peer.is_persisted
									? "success"
									: "error"
							}
						/>
					</Tooltip>
					<Tooltip
						style={{
							justifySelf: "right",
						}}
						title="Actions"
					>
						<MoreVertIcon
							color="disabled"
							style={{
								cursor: "pointer",
							}}
						/>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
};

const SectionTitleInfo = (props: SectionTitleInfoProps) => {
	const { start_node } = useNodeContext();
	const { nodeName, isLoading, isRunning, switchUpdate } = props;
	const [startError, setStartError] = useState("");
	const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);
	const [isBackdropOpen, setIsBackdropOpen] = useState(false);

	return (
		<Card
			style={{
				backgroundColor: "inherit",
				boxShadow: "none",
			}}
		>
			<Typography
				variant="h6"
				style={{ justifySelf: "end" }}
				sx={{
					textAlign: "end",
					color: "gray",
					cursor: "pointer",
				}}
			>
				{isRunning ? (
					<MenuButton
						switchUpdate={switchUpdate}
						walletName={nodeName}
						isLoading={Boolean(isLoading)}
					/>
				) : (
					<IconButton
						disabled={isLoading}
						title="Start node"
						color="error"
						onClick={async (_) => {
							setIsBackdropOpen(true);
							const [success, message] =
								await start_node(nodeName);
							if (!success) {
								const m = message.includes(
									"Failed to update fee rate estimates"
								)
									? `${message} Validate your Esplora URL is accessible`
									: "Failed to start node";
								setStartError(m);
								setIsOpenSnackbar(true);
								setIsBackdropOpen(false);
							} else {
								switchUpdate();
								setTimeout(() => {}, 5000);
								setIsBackdropOpen(false);
							}
						}}
					>
						<PlayCircleFilledWhiteIcon fontSize="large" />
					</IconButton>
				)}
			</Typography>
			<Snackbar
				message={startError}
				open={isOpenSnackbar}
				setOpen={setIsOpenSnackbar}
			/>
			<Backdrop
				sx={{
					color: "#fff",
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={isBackdropOpen}
			>
				<SyncIcon fontSize="large" color="inherit" />
				<p style={{ textAlign: "center" }}>Starting Node</p>
			</Backdrop>
		</Card>
	);
};

const SectionTitle = (props: SectionTitleProps) => {
	const { title, onClick } = props;
	return (
		<Card
			style={{
				backgroundColor: "inherit",
				height: "4vh",
				boxShadow: "none",
				display: "grid",
				padding: "1em",
				gridTemplateColumns: "1fr 1fr",
			}}
			onClick={() => {
				!props.disabled ? onClick() : null;
			}}
		>
			<Typography
				variant="h6"
				sx={{
					color: "#344e41",
					cursor: props.disabled ? "default" : "pointer",
				}}
			>
				{title}
			</Typography>
		</Card>
	);
};

function WalletView(props: WalletData) {
	const { name } = props;
	const nodeName = name;
	const {
		get_node_id,
		get_our_address,
		get_esplora_address,
		is_node_running,
		get_total_onchain_balance,
		list_peers,
		list_channels,
	} = useNodeContext();
	const [nodeId, setNodeId] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");
	const [peers, setPeers] = useState<TablePeerDetails[]>([]);
	const [channels, setChannels] = useState<ChannelDetails[]>([]);
	const [isNodeRunning, setIsNodeRunning] = useState(false);
	const [update, setUpdate] = useState(false);
	const [showNodeInfo] = useState(true);
	const [showPeersInfo, setShowPeersInfo] = useState(true);
	const [showChannelsInfo, setShowChannelsInfo] = useState(true);
	const [totalOnChainBalance, setTotalOnChainBalance] = useState(0);
	const [activePeersStep, setActivePeersStep] = useState(0);
	const [activeChannelsStep, setActiveChannelsStep] = useState(0);
	const [esploraAddress, setEsploraAddress] = useState("");

	const NodeInfoSection = () => {
		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "10fr 1fr",
				}}
			>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(9, 1fr)",
					}}
				>
					<DataCard
						title="Node ID"
						value={
							nodeId
								? ` ${nodeId.slice(
										0,
										5
								  )}..${nodeId.slice(-6)} `
								: "-"
						}
					/>
					<DataCard
						title="Network Address"
						value={
							listeningAddress
								? ` ${listeningAddress} `
								: "-"
						}
					/>
					<DataCard
						title="Esplora Address"
						value={
							esploraAddress
								? `..${esploraAddress.slice(-15)} `
								: "-"
						}
					/>
					<DataCard
						title="On-Chain Balance"
						value={
							isNodeRunning
								? `${totalOnChainBalance} BTC `
								: "-"
						}
					/>
					<DataCard
						title="Lightning Balance"
						value={
							isNodeRunning
								? `${totalOnChainBalance} BTC `
								: "-"
						}
					/>
					<DataCard
						title="In Liquidity"
						value={
							isNodeRunning
								? `${totalOnChainBalance} BTC `
								: "-"
						}
					/>
					<DataCard
						title="Out Liquidity"
						value={
							isNodeRunning
								? `${totalOnChainBalance} BTC `
								: "-"
						}
					/>
					<DataCard
						title="Channels"
						value={
							isNodeRunning ? `${channels.length}` : "-"
						}
					/>
					<DataCard
						title="Peers"
						value={
							isNodeRunning ? `${peers.length}` : "-"
						}
					/>
				</div>
				<div style={{ padding: "1em" }}>
					<SectionTitleInfo
						switchUpdate={switchUpdate}
						nodeName={nodeName}
						isFold={showNodeInfo}
						isRunning={isNodeRunning}
					/>
				</div>
			</div>
		);
	};

	const switchUpdate = () => setUpdate(!update);

	useEffect(() => {
		const handler = async () => {
			let ourListeningAddress = await get_our_address(nodeName);
			let esploraAddress = await get_esplora_address(nodeName);
			setListeningAddress(ourListeningAddress);
			setEsploraAddress(esploraAddress);
		};
		handler();
	}, [nodeName]);

	useEffect(() => {
		const handler = async () => {
			let isRunning = await is_node_running(nodeName);
			if (isRunning) {
				let node_id = await get_node_id(nodeName);
				let on_chain_balance =
					await get_total_onchain_balance(nodeName);
				let esploraAddress = await get_esplora_address(
					nodeName
				);
				let peers = await list_peers(nodeName);
				const new_rows: TablePeerDetails[] = peers.map(
					(row: PeerDetails) => {
						return {
							node_id: row.node_id,
							is_connected: row.is_connected,
							is_persisted: row.is_persisted,
							address: row.address,
							shared_channels: row.shared_channels,
						};
					}
				);
				const channels = await list_channels(nodeName);
				setChannels(channels);
				setPeers(new_rows);
				setTotalOnChainBalance(on_chain_balance);
				setNodeId(node_id);
				setEsploraAddress(esploraAddress);
				setIsNodeRunning(isRunning);
			} else {
				setNodeId("");
				setPeers([]);
				setChannels([]);
				setListeningAddress("");
				setTotalOnChainBalance(0);
				setIsNodeRunning(false);
			}
		};
		handler();
		return () => {
			setNodeId("");
			setPeers([]);
			setChannels([]);
			setListeningAddress("");
			setEsploraAddress("");
			setTotalOnChainBalance(0);
			setIsNodeRunning(false);
			setIsNodeRunning(false);
		};
	}, [nodeName, update]);

	if (!nodeName) {
		return <></>;
	}

	return (
		<div>
			<SectionTitle title="Node Info" onClick={() => {}} />
			<NodeInfoSection />
			<Divider variant="middle" />
			<SectionTitle
				title="Peers"
				disabled={true}
				onClick={() => setShowPeersInfo(!showPeersInfo)}
			/>
			<Stepper
				activeStep={activePeersStep}
				setActiveStep={setActivePeersStep}
				shownCount={4}
				dataLength={peers.length}
			/>
			<FourHorizontalCards>
				{peers
					?.slice(
						activePeersStep * 4,
						peers.length < activePeersStep * 4 + 4
							? peers.length
							: activePeersStep * 4 + 4
					)
					.map((peer) => {
						return (
							<PeerCard
								peer={peer}
								key={peer.node_id}
							/>
						);
					})}
			</FourHorizontalCards>
			<Divider variant="middle" />
			<SectionTitle
				title="Channels"
				disabled={true}
				onClick={() => setShowChannelsInfo(!showChannelsInfo)}
			/>
			<Stepper
				activeStep={activeChannelsStep}
				setActiveStep={setActiveChannelsStep}
				shownCount={4}
				dataLength={channels.length}
			/>
			<FourHorizontalCards>
				{channels
					?.slice(
						activeChannelsStep * 4,
						channels.length < activeChannelsStep * 4 + 4
							? channels.length
							: activeChannelsStep * 4 + 4
					)
					.map((channel) => {
						return (
							<ChannelCard
								channel={channel}
								key={channel.channel_id}
							/>
						);
					})}
			</FourHorizontalCards>
		</div>
	);
}

const FourHorizontalCards = styled("div")({
	display: "grid",
	gap: "1em",
	paddingLeft: "1em",
	gridTemplateColumns: "1fr 1fr 1fr 1fr",
});

export default WalletView;
