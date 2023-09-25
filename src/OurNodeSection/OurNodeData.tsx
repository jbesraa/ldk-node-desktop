import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useNodeContext } from "../NodeContext";
import { useEffect, useState } from "react";

function OurNodeData() {
	const {
		get_node_id,
		get_our_address,
		get_total_onchain_balance,
		new_onchain_address,
	} = useNodeContext();
	const [nodeId, setNodeId] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");
	const [onChainAddress, setOnChainAddress] = useState("");
	const [onChainBalance, setOnChainBalance] = useState(0);


	useEffect(() => {
		const init = async () => {
			let node_id = await get_node_id();
			let ourListeningAddress = await get_our_address();
			let onChainBalance = await get_total_onchain_balance();
			let onChainAddress = await new_onchain_address();
			setNodeId(node_id);
			setListeningAddress(ourListeningAddress);
			setOnChainAddress(onChainAddress);
			setOnChainBalance(onChainBalance);
		};
		init();
	}, []);

	return (
		<Card
			sx={{
				minWidth: 275,
				color: "#344e41",
				backgroundColor: "#dad7cd",
			}}
		>
			<CardContent>
				<Typography sx={{ mb: 1.5 }} color="text.secondary">
					Node ID: {nodeId}
				</Typography>
				<Typography variant="body2">
					Address: {listeningAddress}
				</Typography>
				<Typography variant="body2">
					On chain balance: {onChainBalance} Satoshis
				</Typography>
				<Typography variant="body2">
					On chain Address: {onChainAddress}
				</Typography>
			</CardContent>
		</Card>
	);
}

export default OurNodeData;
