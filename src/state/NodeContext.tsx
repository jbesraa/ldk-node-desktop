import { invoke } from "@tauri-apps/api/tauri";
import { createContext, useContext, useState } from "react";
import {
	ChannelDetails,
	PeerDetails,
	PaymentData,
	ConnectToPeerInput,
	BitcoinUnit,
} from "../types";
import { info, error } from "tauri-plugin-log-api";

export interface NodeActions {
	get_logs: () => Promise<string[]>;
	sync_wallet: () => Promise<boolean>;
	connect_to_peer: (i: ConnectToPeerInput) => Promise<boolean>;
	start_node: (i: string) => Promise<boolean>;
	stop_node: (nodeName: string) => Promise<boolean>;
	list_peers: (nodeName: string) => Promise<PeerDetails[]>;
	new_onchain_address: (nodeName: string) => Promise<string>;
	is_node_running: (nodeName: string) => Promise<boolean>;
	get_our_address: (nodeName: string) => Promise<string>;
	get_esplora_address: (nodeName: string) => Promise<string>;
	get_node_id: (nodeName: string) => Promise<string>;
	get_total_onchain_balance: (nodeName: string) => Promise<number>;
	get_network: (nodeName: string) => Promise<string>;
	list_channels: (nodeName: string) => Promise<ChannelDetails[]>;
	list_payments: (nodeName: string) => Promise<PaymentData[]>;
	disconnect_peer: (
		nodeName: string,
		i: string
	) => Promise<boolean>;
	update_bitcoin_unit: (i: BitcoinUnit) => void;
	convert_to_current_unit: (
		amount: number,
		amount_unit: BitcoinUnit
	) => number;
	bitcoinUnit: BitcoinUnit;
}

export const useNodeContext = () => useContext(NodeContext);

export const NodeContext = createContext({} as NodeActions);

export const NodeContextProvider = ({
	children,
}: {
	children: any;
}) => {
	const [bitcoinUnit, setBitcoinUnit] = useState(
		BitcoinUnit.Satoshis
	);

	function update_bitcoin_unit(unit: BitcoinUnit) {
		setBitcoinUnit(unit);
	}

	function convert_satoshis_to_milisatoshis(
		amount: number
	): number {
		return amount * 1000;
	}

	function convert_milisatoshis_to_satoshis(
		amount: number
	): number {
		return amount / 1000;
	}

	function convert_satoshis_to_btc(amount: number): number {
		return amount / 100000000;
	}

	function convert_btc_to_satoshis(amount: number): number {
		return amount * 100000000;
	}

	function convert_btc_to_milisatoshis(amount: number): number {
		return amount * 100000000000;
	}

	function convert_milisatoshis_to_btc(amount: number): number {
		return amount / 100000000000;
	}

	function convert_to_current_unit(
		amount: number,
		amount_unit: BitcoinUnit
	): number {
		if (
			amount_unit === BitcoinUnit.Satoshis &&
			bitcoinUnit === BitcoinUnit.MillionthSatoshis
		) {
			return convert_satoshis_to_milisatoshis(amount);
		}
		if (
			amount_unit === BitcoinUnit.Satoshis &&
			bitcoinUnit === BitcoinUnit.BTC
		) {
			return convert_satoshis_to_btc(amount);
		}
		if (
			amount_unit === BitcoinUnit.MillionthSatoshis &&
			bitcoinUnit === BitcoinUnit.Satoshis
		) {
			return convert_milisatoshis_to_satoshis(amount);
		}
		if (
			amount_unit === BitcoinUnit.MillionthSatoshis &&
			bitcoinUnit === BitcoinUnit.BTC
		) {
			return convert_milisatoshis_to_btc(amount);
		}
		if (
			amount_unit === BitcoinUnit.BTC &&
			bitcoinUnit === BitcoinUnit.Satoshis
		) {
			return convert_btc_to_satoshis(amount);
		}
		if (
			amount_unit === BitcoinUnit.BTC &&
			bitcoinUnit === BitcoinUnit.MillionthSatoshis
		) {
			return convert_btc_to_milisatoshis(amount);
		}
		return amount;
	}

	async function sync_wallet(): Promise<boolean> {
		try {
			const synced_wallet: boolean = await invoke(
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
			const res: boolean = await invoke("connect_to_node", {
				nodeName: i.ourNodeName, // our nodename
				nodeId: node_id,
				netAddress: net_address,
			});
			return res;
		} catch (e) {
			console.log("Error Connecting To Peer", e);
			return false;
		}
	}

	async function disconnect_peer(
		nodeName: string,
		i: string
	): Promise<boolean> {
		try {
			const res: boolean = await invoke("disconnect_peer", {
				nodeName,
				nodeId: i,
			});
			return res;
		} catch (e) {
			console.log("Error Disconnecting Peer", e);
			return false;
		}
	}

	async function start_node(nodeName: string): Promise<boolean> {
		try {
			const res: boolean = await invoke("start_node", {
				nodeName,
			});
			info(`Start Node Response: ${res}`);
			return res;
		} catch (e) {
			//@ts-ignore
			error(e.toString());

			console.log("Error Starting Node", e);
			return false;
		}
	}

	async function stop_node(nodeName: string): Promise<boolean> {
		try {
			const res: boolean = await invoke("stop_node", {
				nodeName,
			});
			return res;
		} catch (e) {
			console.log("Error Stopping node", e);
			return false;
		}
	}

	async function list_peers(
		nodeName: string
	): Promise<PeerDetails[]> {
		try {
			const res: PeerDetails[] = await invoke("list_peers", {
				nodeName,
			});
			console.log("peeers", res);
			return res;
		} catch (e) {
			console.log("Error Listing Peers ", e);
			return [] as PeerDetails[];
		}
	}

	async function new_onchain_address(
		nodeName: string
	): Promise<string> {
		try {
			const res: string = await invoke("new_onchain_address", {
				nodeName,
			});
			console.log("HO", res);
			return res;
		} catch (e) {
			console.log("Error new onchain address ", e);
			return "";
		}
	}

	async function is_node_running(
		nodeName: string
	): Promise<boolean> {
		try {
			const res: boolean = await invoke("is_node_running", {
				nodeName,
			});
			return res;
		} catch (e) {
			console.log("Error is_node_running", e);
			return false;
		}
	}

	async function get_network(nodeName: string): Promise<string> {
		try {
			const network: string = await invoke("get_network", {
				nodeName,
			});
			return network;
		} catch (e) {
			console.log("Error get_network", e);
			return "";
		}
	}

	async function get_node_id(nodeName: string): Promise<string> {
		try {
			const res: string = await invoke("get_node_id", {
				nodeName,
			});
			return res;
		} catch (e) {
			console.log("Error get_node_id", e);
			return "";
		}
	}

	async function get_total_onchain_balance(
		nodeName: string
	): Promise<number> {
		try {
			const res: number = await invoke(
				"total_onchain_balance",
				{ nodeName }
			);
			return res;
		} catch (e) {
			console.log("Error get_total_onchain_balance", e);
			return 0;
		}
	}

	async function get_logs(): Promise<string[]> {
		try {
			const res: string[] = await invoke("get_logs", {});
			return res;
		} catch (e) {
			console.log("Error get_logs", e);
			return [];
		}
	}

	async function get_our_address(
		nodeName: string
	): Promise<string> {
		try {
			if (!nodeName) return "";
			const res: string = await invoke("get_our_address", {
				nodeName,
			});
			return res;
		} catch (e) {
			console.log("Error get_our_address", e);
			return "";
		}
	}

	async function get_esplora_address(
		nodeName: string
	): Promise<string> {
		try {
			console.log("here");
			if (!nodeName) return "";
			const res: string = await invoke("get_esplora_address", {
				nodeName,
			});
			console.log("here", res);
			return res;
		} catch (e) {
			console.log("Error get_esplora_address", e);
			return "";
		}
	}

	async function list_payments(
		nodeName: string
	): Promise<PaymentData[]> {
		try {
			const res: PaymentData[] = await invoke("list_payments", {
				nodeName,
			});
			return res;
		} catch (e) {
			console.log("Error list_payments", e);
			return [];
		}
	}

	async function list_channels(
		nodeName: string
	): Promise<ChannelDetails[]> {
		try {
			const res: ChannelDetails[] = await invoke(
				"list_channels",
				{ nodeName }
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
		list_payments,
		disconnect_peer,
		get_network,
		update_bitcoin_unit,
		convert_to_current_unit,
		bitcoinUnit,
		get_esplora_address,
		get_logs,
	};

	return (
		<NodeContext.Provider value={state}>
			{children}
		</NodeContext.Provider>
	);
};
