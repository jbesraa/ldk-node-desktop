import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useNodeContext } from "../NodeContext";
import { useEffect, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { writeText } from "@tauri-apps/api/clipboard";

function OurNodeData() {
	const {
		get_node_id,
		get_our_address,
		new_onchain_address,
		is_node_running
	} = useNodeContext();
	const [nodeId, setNodeId] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");
	const [onChainAddress, setOnChainAddress] = useState("");
	const [isNodeRunning, setIsNodeRunning] = useState(false);

	useEffect(() => {
		const timer = setInterval(async () => {
			let res = await is_node_running();
			setIsNodeRunning(res);
		}, 10000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const init = async () => {
			if(!isNodeRunning) return;
			let node_id = await get_node_id();
			let ourListeningAddress = await get_our_address();
			let onChainAddress = await new_onchain_address();
			setNodeId(node_id);
			setListeningAddress(ourListeningAddress);
			setOnChainAddress(onChainAddress);
		};

		init()
	}, [isNodeRunning]);

	return (
		<Card
			sx={{
				minWidth: 275,
				color: "#344e41",
				backgroundColor: "#dad7cd",
			}}
		>
			<CardContent>
				<Typography variant="subtitle1" color="text.secondary" >
					Node ID: {nodeId.slice(0, 10) + "..." + nodeId.slice(-10)}{" "}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(nodeId)}>
						<ContentCopyIcon />
					</span>
				</Typography>
				<Typography variant="subtitle1" color="text.secondary" >
					Address: {listeningAddress}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(listeningAddress)}>
						<ContentCopyIcon />
					</span>
				</Typography>
				<Typography variant="subtitle1" color="text.secondary" >
					On chain Address: {onChainAddress}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(onChainAddress)}>
						<ContentCopyIcon />
					</span>
				</Typography>
			</CardContent>
		</Card>
	);
}

export default OurNodeData;
