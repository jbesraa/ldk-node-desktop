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
	const [onChainAddress, setOnChainAddress] = useState("");
	const [isNodeRunning, setIsNodeRunning] = useState(false);

	// useEffect(() => {
	// 	const timer = setInterval(async () => {
	// 		let res = await is_node_running();
	// 		setIsNodeRunning(res);
	// 	}, 3000);
	// 	return () => clearInterval(timer);
	// }, []);

	useEffect(() => {
		const init = async () => {
			if(!isNodeRunning) return;
			let node_id = await get_node_id();
			let ourListeningAddress = await get_our_address();
			let chainAddress = await new_onchain_address();
			setNodeId(node_id);
			setOnChainAddress(chainAddress)
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
					Node ID: {` ${nodeId} `}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(nodeId)}>
						<ContentCopyIcon />
					</span>
				</Typography>
				<Typography variant="subtitle1" color="white" >
					Network Address: {` ${listeningAddress} `}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(listeningAddress)}>
						<ContentCopyIcon />
					</span>
				</Typography>
				<Typography variant="subtitle1" color="white" >
					On-Chain Address: {` ${onChainAddress} `}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(onChainAddress)}>
						<ContentCopyIcon />
					</span>
				</Typography>
			</CardContent>
		</Card>
	);
}

export default OurNodeData;
