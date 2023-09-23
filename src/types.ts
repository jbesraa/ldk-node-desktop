export interface PeerDetails {
  node_id: string;
  address: string;
  is_persisted: boolean;
  is_connected: boolean;
}

export interface ChannelDetails {
     channel_id: string,
     counterparty_node_id: string,
     // funding_txo: Option<OutPoint>,
     channel_value_sats: number,
     unspendable_punishment_reserve: number | null,
     feerate_sat_per_1000_weight: number,
     balance_msat: number,
     outbound_capacity_msat: number,
     inbound_capacity_msat: number,
     confirmations_required: number | null,
     confirmations: number | null,
     is_outbound: boolean,
     is_channel_ready: boolean,
     is_usable: boolean,
     is_public: boolean,
     cltv_expiry_delta: number | null,
}
