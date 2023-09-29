import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { writeText } from "@tauri-apps/api/clipboard";
import { useNodeContext } from "../../../state/NodeContext";

function OurNodeData() {
	const {
		get_node_id,
		get_our_address,
		new_onchain_address,
		is_node_running
	} = useNodeContext();
	const [nodeId, setNodeId] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");
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
			setNodeId(node_id);
			setListeningAddress(ourListeningAddress);
		};

		init()
	}, [isNodeRunning]);

	return (
		<Card
			sx={{
				minWidth: 275,
				backgroundColor: "#344e41",
			}}
		>
			<CardContent>
				<Typography variant="subtitle1" color="white" >
					Node ID: {nodeId.slice(0, 10) + "..." + nodeId.slice(-10)}{" "}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(nodeId)}>
						<ContentCopyIcon />
					</span>
				</Typography>
				<Typography variant="subtitle1" color="white" >
					Address: {listeningAddress}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(listeningAddress)}>
						<ContentCopyIcon />
					</span>
				</Typography>
			</CardContent>
		</Card>
	);
}

export default OurNodeData;
