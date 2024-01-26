export interface PeerDetails {
	node_id: string;
	address: string;
	is_persisted: string;
	is_connected: string;
	shared_channels: number;
}

export interface ChannelDetails {
	channel_id: string;
	counterparty_node_id: string;
	// funding_txo: Option<OutPoint>,
	channel_value_sats: number;
	unspendable_punishment_reserve: number | null;
	feerate_sat_per_1000_weight: number;
	balance_msat: number;
	outbound_capacity_msat: number;
	inbound_capacity_msat: number;
	confirmations_required: number | null;
	confirmations: number | null;
	is_outbound: boolean;
	is_channel_ready: boolean;
	is_usable: boolean;
	is_public: boolean;
	cltv_expiry_delta: number | null;
}

export interface TablePeerDetails {
	node_id: string;
	is_connected: string;
	is_persisted: string;
	address: string;
	shared_channels: number;
}

export interface PaymentData {
	hash: string;
	preimage?: string;
	secret?: string;
	amount_msat: number;
	direction: String;
	status: String;
}

export interface ConnectToPeerInput {
	node_id: string;
	ourNodeName: string;
	net_address: string;
}

export enum BitcoinUnit {
	Satoshis = "Sats",
	MillionthSatoshis = "MSats",
	BTC = "BTC",
}

export interface CreateWalletInput {
	walletName: string;
	listeningAddress: string;
	esploraAddress: string;
}

export enum Network {
	Bitcoin = "bitcoin",
	Testnet = "testnet",
}

export interface TablePeerDetails {
	node_id: string;
	is_connected: string;
	is_persisted: string;
	address: string;
	shared_channels: number;
}

export interface StartNodeInput {
	network: Network;
	storageDir: string;
	listeningAddress: string;
	esploraAddress: string;
}

export interface UpdateConfigInput {
	esploraAddress: string;
	listeningAddress: string;
}
