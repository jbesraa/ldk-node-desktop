import {
	Card,
	CardContent,
	Divider,
	IconButton,
	Tooltip,
	Typography,
} from "@mui/material";
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
import DataSaverOnIcon from "@mui/icons-material/DataSaverOn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PublicIcon from "@mui/icons-material/Public";
import FlagIcon from "@mui/icons-material/Flag";

export interface Tx {
	time: number;
	txid: string;
	fee?: number;
	amount: number;
}

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
}

const SectionTitleInfo = (props: SectionTitleInfoProps) => {
	const { start_node } = useNodeContext();
	const { nodeName, isLoading, isRunning } = props;
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
						walletName={nodeName}
						isLoading={Boolean(isLoading)}
					/>
				) : (
					<IconButton
						disabled={isLoading}
						title="Start node"
						color="error"
						onClick={async (_) => {
							const res = await start_node(nodeName);
							console.log(res);
						}}
					>
						<PlayCircleFilledWhiteIcon fontSize="large" />
					</IconButton>
				)}
			</Typography>
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
	const [showNodeInfo] = useState(true);
	const [showPeersInfo, setShowPeersInfo] = useState(true);
	const [showChannelsInfo, setShowChannelsInfo] = useState(true);
	const [totalOnChainBalance, setTotalOnChainBalance] = useState(0);
	const [activePeersStep, setActivePeersStep] = useState(0);
	const [activeChannelsStep, setActiveChannelsStep] = useState(0);
	const [esploraAddress, setEsploraAddress] = useState("");

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
				console.log(nodeName);
				console.log(node_id);
				let on_chain_balance = await get_total_onchain_balance(
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
			setTotalOnChainBalance(0);
			setIsNodeRunning(false);
		};
	}, [nodeName]);

	if (!nodeName) {
		return <></>;
	}
	return (
		<div>
			<div
				style={{
					color: "primary",
					paddingTop: "1em",
					paddingLeft: "1em",
					paddingBottom: "0em",
				}}
			>
				<SectionTitle title="Node Info" onClick={() => {}} />
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "10fr 1fr",
				}}
			>
				<div
					style={{
						display: showNodeInfo ? "block" : "none",
					}}
				>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(9, 1fr)",
						}}
					>
						<div>
							<Tooltip
								style={{ cursor: "pointer" }}
								title="Node ID, click to copy"
							>
								<Card
									onClick={() => writeText(nodeId)}
									sx={{
										boxShadow: "none",
										backgroundColor: "inherit",
										paddingLeft: "0.5em",
									}}
								>
									<CardContent>
										<Typography variant="subtitle2" color="gray">
											Node ID
										</Typography>
										<Typography
											variant="subtitle1"
											style={{
												whiteSpace: "pre-wrap",
												wordWrap: "break-word",
											}}
											color="primary"
										>
											{nodeId
												? ` ${nodeId.slice(0, 5)}..${nodeId.slice(
														-6
												  )} `
												: "-"}
										</Typography>
									</CardContent>
								</Card>
							</Tooltip>
						</div>
						<Card
							sx={{
								boxShadow: "none",
								backgroundColor: "inherit",
							}}
						>
							<CardContent>
								<Typography variant="subtitle2" color="gray">
									Network Address
								</Typography>
								<Typography
									variant="subtitle1"
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
									}}
									color="primary"
								>
									{listeningAddress ? ` ${listeningAddress} ` : "-"}
								</Typography>
							</CardContent>
						</Card>
						<Tooltip title="Esplora Address, click to copy">
							<Card
								sx={{
									boxShadow: "none",
									cursor: "pointer",
									backgroundColor: "inherit",
								}}
								onClick={() => writeText(esploraAddress)}
							>
								<CardContent>
									<Typography variant="subtitle2" color="gray">
										Esplora Address
									</Typography>
									<Typography variant="subtitle1" color="primary">
										{esploraAddress
											? `..${esploraAddress.slice(-15)} `
											: "-"}
									</Typography>
								</CardContent>
							</Card>
						</Tooltip>
						<Card
							sx={{
								boxShadow: "none",
								backgroundColor: "inherit",
							}}
						>
							<CardContent>
								<Typography variant="subtitle2" color="gray">
									On-Chain Balance
								</Typography>
								<Typography
									variant="subtitle1"
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
									}}
									color="primary"
								>
									{isNodeRunning
										? `${totalOnChainBalance} BTC `
										: "-"}
								</Typography>
							</CardContent>
						</Card>
						<Card
							sx={{
								boxShadow: "none",
								backgroundColor: "inherit",
							}}
						>
							<CardContent>
								<Typography variant="subtitle2" color="gray">
									Lightning Balance
								</Typography>
								<Typography
									variant="subtitle1"
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
									}}
									color="primary"
								>
									{isNodeRunning
										? `${totalOnChainBalance} BTC `
										: "-"}
								</Typography>
							</CardContent>
						</Card>
						<Card
							sx={{
								boxShadow: "none",
								backgroundColor: "inherit",
							}}
						>
							<CardContent>
								<Typography variant="subtitle2" color="gray">
									In Liquidity
								</Typography>
								<Typography
									variant="subtitle1"
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
									}}
									color="primary"
								>
									{isNodeRunning
										? `${totalOnChainBalance} BTC `
										: "-"}
								</Typography>
							</CardContent>
						</Card>
						<Card
							sx={{
								boxShadow: "none",
								backgroundColor: "inherit",
							}}
						>
							<CardContent>
								<Typography variant="subtitle2" color="gray">
									Out Liquidity
								</Typography>
								<Typography
									variant="subtitle1"
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
									}}
									color="primary"
								>
									{isNodeRunning
										? `${totalOnChainBalance} BTC `
										: "-"}
								</Typography>
							</CardContent>
						</Card>
						<Card
							sx={{
								boxShadow: "none",
								backgroundColor: "inherit",
							}}
						>
							<CardContent>
								<Typography variant="subtitle2" color="gray">
									Channels
								</Typography>
								<Typography
									variant="subtitle1"
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
									}}
									color="primary"
								>
									{isNodeRunning ? `${channels.length}` : "-"}
								</Typography>
							</CardContent>
						</Card>
						<Card
							sx={{
								boxShadow: "none",
								backgroundColor: "inherit",
							}}
						>
							<CardContent>
								<Typography variant="subtitle2" color="gray">
									Peers
								</Typography>
								<Typography
									variant="subtitle1"
									style={{
										whiteSpace: "pre-wrap",
										wordWrap: "break-word",
									}}
									color="primary"
								>
									{isNodeRunning ? `${peers.length}` : "-"}
								</Typography>
							</CardContent>
						</Card>
					</div>
				</div>
				<div style={{ padding: "1em" }}>
					<SectionTitleInfo
						nodeName={nodeName}
						isFold={showNodeInfo}
						isRunning={isNodeRunning}
					/>
				</div>
			</div>
			<Divider variant="middle" />
			<div
				style={{
					color: "primary",
					padding: "1em",
					paddingBottom: "0em",
				}}
			>
				<SectionTitle
					title="Peers"
					disabled={true}
					onClick={() => setShowPeersInfo(!showPeersInfo)}
				/>
			</div>
			<div
				style={{
					display: showPeersInfo ? "grid" : "none",
				}}
			>
				{Math.ceil(peers.length / 4) > 1 && (
					<Stepper
						activeStep={activePeersStep}
						setActiveStep={setActivePeersStep}
						steps={Math.ceil(peers.length / 4)}
					/>
				)}
				<div
					style={{
						display: "grid",
						gap: "1em",
						paddingLeft: "1em",
						paddingBottom: "1em",
						gridTemplateColumns: "1fr 1fr 1fr 1fr",
					}}
				>
					{peers
						?.slice(
							activePeersStep * 4,
							peers.length < activePeersStep * 4 + 4
								? peers.length
								: activePeersStep * 4 + 4
						)
						.map((peer) => {
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
											Network Address {peer.address}
										</Typography>
										<div
											style={{
												justifySelf: "right",
												display: "grid",
												gridTemplateColumns: "1fr 1fr 1fr",
												gap: "1em",
											}}
										>
											<Tooltip title={ peer.is_connected ?  "Peer is online": "Peer is offline"}>
												<ConnectWithoutContactIcon
													color={
														peer.is_connected ? "success" : "error"
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
														peer.is_persisted ? "success" : "error"
													}
												/>
											</Tooltip>
											<Tooltip
												style={{ justifySelf: "right" }}
												title="Actions"
											>
												<MoreVertIcon
													color="disabled"
													style={{ cursor: "pointer" }}
												/>
											</Tooltip>
										</div>
									</CardContent>
								</Card>
							);
						})}
				</div>
			</div>
			<Divider variant="middle" />
			<div
				style={{
					color: "black",
					padding: "1em",
					paddingBottom: "0em",
				}}
			>
				<SectionTitle
					title="Channels"
					disabled={true}
					onClick={() => setShowChannelsInfo(!showChannelsInfo)}
				/>
			</div>
			<div
				style={{
					display: showChannelsInfo ? "grid" : "none",
				}}
			>
				{Math.floor(channels.length / 4) > 1 && (
					<Stepper
						activeStep={activeChannelsStep}
						setActiveStep={setActiveChannelsStep}
						steps={Math.floor(channels.length / 4)}
					/>
				)}
				<div
					style={{
						display: "grid",
						gap: "1em",
						padding: "1em",
						paddingTop: "0em",
						gridTemplateColumns: "1fr 1fr 1fr 1fr",
					}}
				>
					{channels
						?.slice(
							activeChannelsStep * 4,
							channels.length < activeChannelsStep * 4 + 4
								? channels.length
								: activeChannelsStep * 4 + 4
						)
						.map((channel) => {
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
														channel.is_usable ? "success" : "error"
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
														channel.is_public ? "success" : "error"
													}
												/>
											</Tooltip>
											<Tooltip
												style={{ justifySelf: "right" }}
												title="Actions"
											>
												<MoreVertIcon
													color="disabled"
													style={{ cursor: "pointer" }}
												/>
											</Tooltip>
										</div>
									</CardContent>
								</Card>
							);
						})}
				</div>
			</div>
		</div>
	);
}

export default WalletView;
