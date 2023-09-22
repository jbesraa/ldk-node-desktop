import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import styled from "styled-components";
// import "./App.css";

function App() {
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
		return res;
	}

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

	React.useEffect(() => {
		const timer = setInterval(async () => {
			await is_node_running();
		}, 10000);
		return () => clearInterval(timer);
	}, []);

	const nodeOffStyle = {
		fontSize: "2em",
		justifySelf: "start",
		alignSelf: "center",
		color: "palevioletred",
	};

	const nodeOnStyle = {
		fontSize: "2em",
		justifySelf: "start",
		alignSelf: "center",
		color: "#3cb371",
	};

	return (
		<Wrapper>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
				}}
			>
				<div
					style={isNodeRunning ? nodeOnStyle : nodeOffStyle}
				>
					Flower
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gridGap: "1em",
					}}
				>
					<button onClick={handleStatusToggle}>
						{isNodeRunning ? "Stop Node" : "Start Node"}
					</button>
					<button onClick={sync_wallet}>Sync Wallet</button>
					<button onClick={open_channel}>Open Channel</button>
					<button onClick={connect_to_peer}>Connect To Peer</button>
				</div>
			</div>
			<div>
				<NodeInfo
					start_node={start_node}
					stop_node={stop_node}
					isNodeRunning={isNodeRunning}
				/>
			</div>
			<PeersInfo />
			{/** 
				<ChannelsInfo />
				<button onClick={connect_to_peer}>
					Connect To Peer
				</button>
				<button onClick={new_onchain_address}>
					Generate New Onchain Address
				</button>
				<button onClick={sync_wallet}>Sync Wallet</button>
				<button onClick={open_channel}>Open Channel</button>**/}
		</Wrapper>
	);
}

const Wrapper = styled.div`
	margin-top: 1em;
	margin-left: 1em;
	margin-right: 1em;
`;

const InfoItem = styled.div`
	display: "grid";
	grid-template-columns: "1fr 1fr";
`;

const InfoItemTitle = styled.div`
	font-size: 1.3em;
	color: gray;
`;

// address length must be at least 24
interface AddressInputProps {
	address: string;
}

const AddressInput = (i: AddressInputProps) => {
	const address = i.address;
	return (
		<div
			style={{
				cursor: "pointer",
				fontSize: "1.5em",
				color: "#00d8ff",
				justifySelf: "end",
				textDecoration: "underline",
			}}
		>{`${address?.slice(0, 23)}..${address?.slice(
			address.length - 5,
			address.length - 1
		)}`}</div>
	);
};

// address length must be at least 24
interface NetAddressInputProps {
	address: string;
}

const NetAddressInput = (i: NetAddressInputProps) => {
	const address = i.address;
	return (
		<div
			style={{
				cursor: "pointer",
				fontSize: "1.5em",
				color: "#00d8ff",
				justifySelf: "end",
				textDecoration: "underline",
			}}
		>
			{address}
		</div>
	);
};

// address length must be at least 24
interface BalanceViewProps {
	balance: string;
}

const BalanceView = (i: BalanceViewProps) => {
	const balance = i.balance;
	return (
		<div
			style={{
				fontSize: "1.5em",
				color: "orange",
				justifySelf: "end",
				textDecoration: "underline",
			}}
		>
			{balance}
		</div>
	);
};

export const NodeInfo = ({
	isNodeRunning,
	start_node,
	stop_node,
}: {
	isNodeRunning: boolean;
	start_node: () => Promise<boolean>;
	stop_node: () => Promise<boolean>;
}) => {
	const [nodeId, setNodeId] = useState("");
	const [onChainBalance, setOnChainBalance] = useState("");
	const [ourAddress, setOurAddress] = useState("");

	async function fetch_basic_info() {
		setNodeId(await invoke("get_node_id", {}));
		setOnChainBalance(await invoke("total_onchain_balance", {}));
		setOurAddress(await invoke("get_our_address", {}));
	}

	React.useEffect(() => {
		fetch_basic_info();
	}, []);

	return (
		<div
			style={{
				width: "100%",
				marginTop: "3em",
				// maxWidth: 1200,
			}}
		>
			<InfoItem>
				<InfoItemTitle>Node Id:</InfoItemTitle>
				<AddressInput address={nodeId} />
			</InfoItem>
			<InfoItem>
				<InfoItemTitle>Listening Address:</InfoItemTitle>{" "}
				<NetAddressInput address={ourAddress} />
			</InfoItem>
			<InfoItem>
				<InfoItemTitle>
					Total On Chain Balance(sats)
				</InfoItemTitle>
				<BalanceView balance={onChainBalance} />
			</InfoItem>
		</div>
	);
};

const PeersInfo = () => {
	const [peers, setPeers] = useState([]);

	async function list_peers() {
		let res = await invoke("list_peers", {});
		console.log(res);
		//@ts-ignore
		setPeers(res);
	}

	React.useEffect(() => {
		list_peers();
	}, []);

	return (
		<div
			style={{
				width: "100%",
				display: "grid",
				marginTop: "3em",
				gridGap: "4em",
				// maxWidth: 1200,
			}}
		>
			<div>
				<InfoItemTitle>Peers</InfoItemTitle>
				<PeersHorizontalCardView peers={peers} />
			</div>
			<div>
				<InfoItemTitle>Channels</InfoItemTitle>
				<ChannelsInfo />
			</div>
		</div>
	);
};

const PeersHorizontalCardView = ({ peers }: { peers: any[] }) => {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gridGap: "0.6em",
				maxHeight: "20em",
				overflow: "scroll",
			}}
		>
			{peers.map((peer) => {
				return (
					<div style={{ width: "100%" }}>
						<InfoItemTitle>Node Id</InfoItemTitle>
						<AddressInput address={peer} />
					</div>
				);
			})}
		</div>
	);
};

export default App;

const ChannelsInfo = () => {
	const [channels, setChannels] = useState([]);
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
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gridGap: "0.6em",
				maxHeight: "20em",
				overflow: "scroll",
			}}
		>
			{channels.map((peer) => {
				console.log(peer);
				return (
					<div style={{ width: "100%" }}>
						<InfoItemTitle>Node Id</InfoItemTitle>
						<AddressInput
							address={peer.counterparty_node_id}
						/>
					</div>
				);
			})}
		</div>
	);
};
