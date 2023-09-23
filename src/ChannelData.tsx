import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ChannelDetails } from "./types";

export default function ChannelData(i: ChannelDetails) {
	const {
		channel_id,
		counterparty_node_id,
		channel_value_sats,
		unspendable_punishment_reserve,
		feerate_sat_per_1000_weight,
		balance_msat,
		outbound_capacity_msat,
		inbound_capacity_msat,
		confirmations_required,
		confirmations,
		is_outbound,
		is_channel_ready,
		is_usable,
		is_public,
		cltv_expiry_delta,
	} = i;

	return (
		<Card sx={{ minWidth: 275 }}>
			<CardContent>
				<Typography
					sx={{ fontSize: 14 }}
					color="text.secondary"
					gutterBottom
				>
					Node Info
				</Typography>
				<Typography variant="h5" component="div">
					Channel Value: {channel_value_sats} Satoshis
				</Typography>
				<Typography variant="h5" component="div">
					Couterparty Node Id: {counterparty_node_id.slice(0, 23)}..
					{counterparty_node_id.slice(
						counterparty_node_id.length - 5,
						counterparty_node_id.length - 1
					)}
				</Typography>
				<Typography variant="h5" component="div">
					Channel Id: {channel_id}
				</Typography>
				<Typography variant="h5" component="div">
					Balance: {balance_msat} msat
				</Typography>
				<Typography variant="h5" component="div">
					Inbound Capacity: {inbound_capacity_msat} msat
				</Typography>
				<Typography variant="h5" component="div">
					Outbound Capacity: {outbound_capacity_msat} msat
				</Typography>
				<Typography variant="h5" component="div">
					{is_channel_ready ? "Channel Ready" : "Channel Not Ready"}
				</Typography>
				<Typography variant="h5" component="div">
					{is_usable ? "Usable" : "Not Usable"}
				</Typography>
				<Typography variant="h5" component="div">
					{is_public ? "Public" : "Not Public"}
				</Typography>
				<Typography variant="h5" component="div">
					{is_outbound ? "Outbound" : "Inbound"}
				</Typography>
				<Typography variant="h5" component="div">
					{confirmations} / {confirmations_required} Confirmations
				</Typography>
				<Typography variant="h5" component="div">
					CLTV Expiry Delta: {cltv_expiry_delta}
				</Typography>
			</CardContent>
			<CardActions>
				<Button disabled={true} size="small">
					More Info
				</Button>
			</CardActions>
		</Card>
	);
}
