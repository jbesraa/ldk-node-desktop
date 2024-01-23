import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { writeText } from "@tauri-apps/api/clipboard";
import { useNodeContext } from "../../../state/NodeContext";

interface OurNodeDataProps {
	nodeName: string;
}

function OurNodeData(props: OurNodeDataProps) {
	const { nodeName } = props;
	console.log(nodeName);
	const {
		get_node_id,
		get_our_address,
		new_onchain_address,
		is_node_running,
	} = useNodeContext();
	const [nodeId, setNodeId] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");
	const [onChainAddress, setOnChainAddress] = useState("");
	const [isNodeRunning, setIsNodeRunning] = useState(false);

	useEffect(() => {
		const timer = setInterval(async () => {
			if (isNodeRunning && nodeId && onChainAddress && listeningAddress) return;
			let res = await is_node_running(nodeName);
			if (res) {
				let node_id = await get_node_id(nodeName);
				let ourListeningAddress = await get_our_address(nodeName);
				let chainAddress = await new_onchain_address(nodeName);
				setNodeId(node_id);
				setOnChainAddress(chainAddress);
				setListeningAddress(ourListeningAddress);
				setIsNodeRunning(res);
			}
		}, 10000);
		return () => clearInterval(timer);
	}, [nodeName]);

	return (
		<Card sx={{ backgroundColor: "#344e41" }}>
			<CardContent>
				<Typography variant="subtitle1" color="white">
					Node ID: {` ${nodeId} `}
					<span
						style={{ cursor: "pointer" }}
						onClick={() => writeText(nodeId)}
					>
						<ContentCopyIcon />
					</span>
				</Typography>
				<Typography variant="subtitle1" color="white">
					Network Address: {` ${listeningAddress} `}
					<span
						style={{ cursor: "pointer" }}
						onClick={() => writeText(listeningAddress)}
					>
						<ContentCopyIcon />
					</span>
				</Typography>
				<Typography variant="subtitle1" color="white">
					On-Chain Address: {` ${onChainAddress} `}
					<span
						style={{ cursor: "pointer" }}
						onClick={() => writeText(onChainAddress)}
					>
						<ContentCopyIcon />
					</span>
				</Typography>
			</CardContent>
		</Card>
	);
}

export default OurNodeData;
