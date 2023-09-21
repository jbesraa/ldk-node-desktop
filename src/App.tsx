import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
	const [nodeId, setNodeId] = useState("");
	const [onChainBalance, setOnChainBalance] = useState("");
	const [ourAddress, setOurAddress] = useState("");

	async function fetch_basic_info() {
		setNodeId(await invoke("get_node_id", {}));
		setOnChainBalance(await invoke("spendable_on_chain", {}));
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

	return (
		<div className="container">
			<h1>Welcome to Tauri!</h1>
			<button onClick={fetch_basic_info}>Fetch Node Info</button>
			<button onClick={start_node}>Start Node</button>
			<button onClick={stop_node}>Stop Node</button>
			<div>Total On Chain Balance: {onChainBalance}</div>
			<div>NodeId: {nodeId}</div>
			<div>Our Address: {ourAddress}</div>
		</div>
	);
}

export default App;
