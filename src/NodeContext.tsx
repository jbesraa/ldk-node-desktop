import { invoke } from "@tauri-apps/api/tauri";
import { createContext, useContext } from "react";
import { ChannelDetails, PeerDetails } from "./types";

export interface NodeActions {
	sync_wallet: () => Promise<boolean>;
	connect_to_peer: (i: ConnectToPeerInput) => Promise<boolean>;
	start_node: () => Promise<boolean>;
	stop_node: () => Promise<boolean>;
	list_peers: () => Promise<PeerDetails[]>;
	new_onchain_address: () => Promise<string>;
	is_node_running: () => Promise<boolean>;
	get_our_address: () => Promise<string>;
	get_node_id: () => Promise<string>;
	get_total_onchain_balance: () => Promise<number>;
	list_channels: () => Promise<ChannelDetails[]>;
}

export interface ConnectToPeerInput {
	node_id: string;
	net_address: string;
}

export const useNodeContext = () => useContext(NodeContext)

export const NodeContext = createContext({} as NodeActions);

export const NodeContextProvider = ({children}:{ children: any }) => {
	async function sync_wallet(): Promise<boolean> {
		try {
			let synced_wallet: boolean = await invoke(
				"sync_wallet",
				{}
			);
			return synced_wallet;
		} catch (e) {
			console.log("Error syncing wallet", e);
			return false;
		}
	}

	async function connect_to_peer(
		i: ConnectToPeerInput
	): Promise<boolean> {
		try {
			const { node_id, net_address } = i;
			let res: boolean = await invoke("connect_to_node", {
				node_id,
				net_address,
			});
			return res;
		} catch (e) {
			console.log("Error Connecting To Peer", e);
			return false;
		}
	}

	async function start_node(): Promise<boolean> {
		try {
			let res: boolean = await invoke("start_node", {});
			return res;
		} catch (e) {
			console.log("Error Starting Node", e);
			return false;
		}
	}

	async function stop_node(): Promise<boolean> {
		try {
			let res: boolean = await invoke("stop_node", {});
			return res;
		} catch (e) {
			console.log("Error Stopping node", e);
			return false;
		}
	}

	async function list_peers(): Promise<PeerDetails[]> {
		try {
			let res: PeerDetails[] = await invoke("list_peers", {});
			return res;
		} catch (e) {
			console.log("Error Listing Peers ", e);
			return [] as PeerDetails[];
		}
	}

	async function new_onchain_address(): Promise<string> {
		try {
			let res: string = await invoke("new_onchain_address", {});
			return res;
		} catch (e) {
			console.log("Error new onchain address ", e);
			return "";
		}
	}

	async function is_node_running(): Promise<boolean> {
		try {
			let res: boolean = await invoke("is_node_running", {});
			return res;
		} catch (e) {
			console.log("Error is_node_running", e);
			return false;
		}
	}

	async function get_node_id(): Promise<string> {
		try {
			const res: string = await invoke("get_node_id", {});
			return res;
		} catch (e) {
			console.log("Error get_node_id", e);
			return "";
		}
	}

	async function get_total_onchain_balance(): Promise<number> {
		try {
			const res: number = await invoke(
				"total_onchain_balance",
				{}
			);
			return res;
		} catch (e) {
			console.log("Error get_total_onchain_balance", e);
			return 0;
		}
	}

	async function get_our_address(): Promise<string> {
		try {
			const res: string = await invoke("get_our_address", {});
			return res;
		} catch (e) {
			console.log("Error get_our_address", e);
			return "";
		}
	}

	async function list_channels(): Promise<ChannelDetails[]> {
		try {
			let res: ChannelDetails[] = await invoke(
				"list_channels",
				{}
			);
			return res;
		} catch (e) {
			console.log("Error list_channels", e);
			return [];
		}
	}

	const state: NodeActions = {
		sync_wallet,
		connect_to_peer,
		start_node,
		stop_node,
		list_peers,
		new_onchain_address,
		is_node_running,
		get_our_address,
		get_node_id,
		get_total_onchain_balance,
		list_channels,
	};

	return (
		<NodeContext.Provider value={state}>
			{children}
		</NodeContext.Provider>
	);
};
