import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
	const [nodeId, setNodeId] = useState("");
	const [onChainBalance, setOnChainBalance] = useState("");
	const [ourAddress, setOurAddress] = useState("");
	const [peers, setPeers] = useState([]);
	const [onchain_address, setOnchainAddress] = useState("");

	async function fetch_basic_info() {
		setNodeId(await invoke("get_node_id", {}));
		setOnChainBalance(await invoke("total_onchain_balance", {}));
	}

	async function sync_wallet() {
		let synced_wallet = await invoke("sync_wallet", {});
		console.log(synced_wallet);
	}

	React.useEffect(() => {
		fetch_basic_info();
		get_our_address();
	}, []);

	async function start_node() {
		let res = await invoke("start_node", {});
		console.log(res)
	}

	async function stop_node() {
		let res = await invoke("stop_node", {});
		console.log(res)
	}

	async function get_our_address() {
		let res: String = await invoke("get_our_address", {});
		//@ts-ignore
		setOurAddress(res);
	}

	async function connect_to_peer() {
		let res = await invoke("connect_to_node", {});
		console.log(res)
	}

	async function list_peers() {
		let res = await invoke("list_peers", {});
		//@ts-ignore
		setPeers(res);
	}

	async function new_onchain_address() {
		let res = await invoke("new_onchain_address", {});
		//@ts-ignore
		setOnchainAddress(res);
	}

	return (
		<div>
			<h1>Welcome to Tauri!</h1>
			<button onClick={start_node}>Start Node</button>
			<button onClick={stop_node}>Stop Node</button>
			<button onClick={connect_to_peer}>Connect To Peer</button>
			<button onClick={list_peers}>List Peers</button>
			<button onClick={new_onchain_address}>Generate New Onchain Address</button>
			<button onClick={sync_wallet}>Sync Wallet</button>
			<div>Total On Chain Balance: {onChainBalance}</div>
			<div>NodeId: {nodeId}</div>
			<div>Our Address: {ourAddress}</div>
			<div>Peers: {peers}</div>
			{onchain_address && <div>Onchain Address: {onchain_address}</div>}
		</div>
	);
}

export default App;
