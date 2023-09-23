import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import styled from "styled-components";
import BasicCard from "./NodeData";
import PeerNodeData from "./PeerNodeData";
import ChannelData from "./ChannelData";
import { ChannelDetails, PeerDetails } from "./types";
import { relaunch, exit } from '@tauri-apps/api/process';


function App() {
	const [channels, setChannels] = useState<ChannelDetails[]>([]);
	const [nodeId, setNodeId] = useState("");
	const [onChainBalance, setOnChainBalance] = useState(0);
	const [ourAddress, setOurAddress] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");

	async function sync_wallet() {
		let synced_wallet = await invoke("sync_wallet", {});
		console.log(synced_wallet);
	}

	async function connect_to_peer() {
		let res = await invoke("connect_to_node", {});
		console.log(res);
	}

	async function open_channel(): Promise<boolean> {
		let res: boolean = await invoke("open_channel", {});
		return res;
	}

	async function start_node(): Promise<boolean> {
		let res: boolean = await invoke("start_node", {});
		await is_node_running();
		return res;
	}

	async function stop_node(): Promise<boolean> {
		let res: boolean = await invoke("stop_node", {});
		await is_node_running();
		await exit(1);
		await relaunch();
		return res;
	}
	const [peers, setPeers] = useState<PeerDetails[]>([]);

	async function list_peers() {
		let res = await invoke("list_peers", {});
		console.log(res);
		//@ts-ignore
		setPeers(res);
	}

	React.useEffect(() => {
		list_peers();
	}, []);

	async function new_onchain_address() {
		let res = await invoke("new_onchain_address", {});
		//@ts-ignore
		setOnchainAddress(res);
	}
	const [isNodeRunning, setIsNodeRunning] = useState(false);

	async function is_node_running() {
		let res = await invoke("is_node_running", {});
		//@ts-ignore
		setIsNodeRunning(res);
	}

	const handleStatusToggle = async () => {
		if (isNodeRunning) {
			await stop_node();
		} else {
			await start_node();
		}
	};
	async function fetch_basic_info() {
		setNodeId(await invoke("get_node_id", {}));
		setOnChainBalance(await invoke("total_onchain_balance", {}));
		setOurAddress(await invoke("get_our_address", {}));
	}

	React.useEffect(() => {
		fetch_basic_info();
	}, []);

	React.useEffect(() => {
		const timer = setInterval(async () => {
			await is_node_running();
			await fetch_basic_info();
			await list_peers();
			await list_channels();
		}, 10000);
		return () => clearInterval(timer);
	}, []);

	const nodeOffStyle = {
		fontSize: "2em",
		textAlign: "center",
		color: "palevioletred",
	};

	const nodeOnStyle = {
		fontSize: "2em",
		textAlign: "center",
		color: "#3cb371",
	};

	async function list_channels() {
		let res = await invoke("list_channels", {});
		console.log(res);
		//@ts-ignore
		setChannels(res);
	}

	React.useEffect(() => {
		list_channels();
	}, []);

	return (
		<Wrapper>
			<div style={isNodeRunning ? nodeOnStyle : nodeOffStyle}>
				Flower
			</div>
			<div
				style={{
					gridGap: "1em",
					paddingTop: "2em",
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
				}}
			>
				<BasicCard
					nodeId={nodeId}
					onChainBalance={onChainBalance}
					listeningAddress={listeningAddress}
					isNodeRunning={isNodeRunning}
					isWalletSynced={isNodeRunning ? true : false}
				/>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr 1fr",
						gridGap: "0.8em",
					}}
				>
					<button onClick={handleStatusToggle}>
						{isNodeRunning ? "Stop Node" : "Start Node"}
					</button>
					<button onClick={sync_wallet}>Sync Wallet</button>
					<button onClick={open_channel}>
						Open Channel
					</button>
					<button onClick={connect_to_peer}>
						Connect To Peer
					</button>
					<button onClick={connect_to_peer}>
						Create Invoice
					</button>
					<button onClick={connect_to_peer}>
						Pay Invoice
					</button>
				</div>
			</div>
			{isNodeRunning ? (
				<>
					<div style={{ paddingTop: "4em" }}>
						<InfoItemTitle>Peers</InfoItemTitle>
						<PeersHorizontalCardView peers={peers} />
					</div>
					<div style={{ paddingTop: "4em" }}>
						<InfoItemTitle>Channels</InfoItemTitle>
						<ChannelsHorizontalCardView
							channels={channels}
						/>
					</div>
				</>
			) : (
				<></>
			)}
		</Wrapper>
	);
}

const Wrapper = styled.div`
	margin-top: 1em;
	margin-left: 8em;
	margin-right: 8em;
`;

const InfoItemTitle = styled.div`
	font-size: 1.3em;
	color: gray;
`;

const PeersHorizontalCardView = ({
	peers,
}: {
	peers: PeerDetails[];
}) => {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr 1fr 1fr",
				gridGap: "0.6em",
				maxHeight: "20em",
				overflow: "scroll",
			}}
		>
			{peers.map((peer) => {
				return <PeerNodeData {...peer} />;
			})}
		</div>
	);
};

const ChannelsHorizontalCardView = ({
	channels,
}: {
	channels: ChannelDetails[];
}) => {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr 1fr 1fr",
				gridGap: "0.6em",
				maxHeight: "20em",
				overflow: "scroll",
			}}
		>
			{channels.map((channel) => {
				return <ChannelData {...channel} />;
			})}
		</div>
	);
};

export default App;
