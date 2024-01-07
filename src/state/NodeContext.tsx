import { invoke } from "@tauri-apps/api/tauri";
import {
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	ChannelDetails,
	PeerDetails,
	PaymentData,
	ConnectToPeerInput,
	BitcoinUnit,
	StartNodeInput,
} from "../types";
import { useBitcoinContext } from "./BitcoinContext";
import { info, error } from "tauri-plugin-log-api";

export interface NodeActions {
	get_logs: () => Promise<string[]>;
	sync_wallet: () => Promise<boolean>;
	connect_to_peer: (i: ConnectToPeerInput) => Promise<boolean>;
	start_node: (i: StartNodeInput) => Promise<boolean>;
	stop_node: () => Promise<boolean>;
	list_peers: () => Promise<PeerDetails[]>;
	new_onchain_address: () => Promise<string>;
	is_node_running: () => Promise<boolean>;
	get_our_address: () => Promise<string>;
	get_node_id: () => Promise<string>;
	get_total_onchain_balance: () => Promise<number>;
	get_network: () => Promise<string>;
	list_channels: () => Promise<ChannelDetails[]>;
	list_payments: () => Promise<PaymentData[]>;
	disconnect_peer: (i: string) => Promise<boolean>;
	update_bitcoin_unit: (i: BitcoinUnit) => void;
	convert_to_current_unit: (
		amount: number,
		amount_unit: BitcoinUnit
	) => number;
	bitcoinUnit: BitcoinUnit;
	currentBlockHeight: number;
}

export const useNodeContext = () => useContext(NodeContext);

export const NodeContext = createContext({} as NodeActions);

export const NodeContextProvider = ({
	children,
}: {
	children: any;
}) => {
	const { connectToEsplora } = useBitcoinContext();
	const [bitcoinUnit, setBitcoinUnit] = useState(
		BitcoinUnit.Satoshis
	);
	const [currentBlockHeight, setCurrentBlockHeight] = useState(0);

	// useEffect(() => {
	// 	const timer = setInterval(async () => {
	// 		await get_height();
	// 	}, 50000);
	// 	return () => clearInterval(timer);
	// }, []);

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
				nodeId: node_id,
				netAddress: net_address,
			});
			return res;
		} catch (e) {
			console.log("Error Connecting To Peer", e);
			return false;
		}
	}

	async function disconnect_peer(i: string): Promise<boolean> {
		try {
			const res: boolean = await invoke("disconnect_peer", {
				nodeId: i,
			});
			return res;
		} catch (e) {
			console.log("Error Disconnecting Peer", e);
			return false;
		}
	}

	async function start_node(i: StartNodeInput): Promise<boolean> {
		try {
			info(`Starting Node: ${JSON.stringify(i)}`);
			const esploraResponse = await connectToEsplora(
				i.esploraAddress
			);
			info(`Esplora Response: ${esploraResponse}`);
			if (esploraResponse) {
				const res: boolean = await invoke("start_node", {
					...i,
				});
				info(`Start Node Response: ${res}`);
				return res;
			}
			return false;
		} catch (e) {
			//@ts-ignore
			error(e.toString());

			console.log("Error Starting Node", e);
			return false;
		}
	}

	async function stop_node(): Promise<boolean> {
		try {
			const res: boolean = await invoke("stop_node", {});
			return res;
		} catch (e) {
			console.log("Error Stopping node", e);
			return false;
		}
	}

	async function list_peers(): Promise<PeerDetails[]> {
		try {
			const res: PeerDetails[] = await invoke("list_peers", {});
			return res;
		} catch (e) {
			console.log("Error Listing Peers ", e);
			return [] as PeerDetails[];
		}
	}

	async function new_onchain_address(): Promise<string> {
		try {
			const res: string = await invoke(
				"new_onchain_address",
				{}
			);
			return res;
		} catch (e) {
			console.log("Error new onchain address ", e);
			return "";
		}
	}

	async function is_node_running(): Promise<boolean> {
		try {
			const res: boolean = await invoke("is_node_running", {});
			return res;
		} catch (e) {
			console.log("Error is_node_running", e);
			return false;
		}
	}

	async function get_network(): Promise<string> {
		try {
			const network: string = await invoke("get_network", {});
			return network;
		} catch (e) {
			console.log("Error get_network", e);
			return "";
		}
	}

	async function get_height(): Promise<void> {
		try {
			//@ts-ignore
			invoke("get_height", {}).then((h: number) => {
				info(`Height: ${h}`);
				setCurrentBlockHeight(h);
			});
		} catch (e) {
			console.log("Error get_height", e);
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

	async function get_logs(): Promise<string[]> {
		try {
			const res: string[] = await invoke("get_logs", {});
			return res;
		} catch (e) {
			console.log("Error get_logs", e);
			return [];
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

	async function list_payments(): Promise<PaymentData[]> {
		try {
			const res: PaymentData[] = await invoke(
				"list_payments",
				{}
			);
			return res;
		} catch (e) {
			console.log("Error list_payments", e);
			return [];
		}
	}

	async function list_channels(): Promise<ChannelDetails[]> {
		try {
			const res: ChannelDetails[] = await invoke(
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
		list_payments,
		disconnect_peer,
		get_network,
		update_bitcoin_unit,
		convert_to_current_unit,
		bitcoinUnit,
		get_logs,
		currentBlockHeight,
	};

	return (
		<NodeContext.Provider value={state}>
			{children}
		</NodeContext.Provider>
	);
};
