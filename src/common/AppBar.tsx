import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import BoltIcon from "@mui/icons-material/Bolt";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNodeContext } from "../NodeContext";
import DialogWindow from "./Dialog";
import StartNodeDialog from "../OurNodeSection/Actions/StartNode";

const buttonStyle = {
	color: "#344e41",
	width: "100%",
	fontWeight: "600",
	backgroundColor: "#a3b18a",
};

export default function MenuAppBar() {
	const {
		start_node,
		sync_wallet,
		is_node_running,
		get_network,
		bitcoinUnit,
		get_total_onchain_balance,
	} = useNodeContext();
	const [boltColor, setBoltColor] = useState("inherit");
	const [isNodeRunning, setIsNodeRunning] = useState(false);
	const [network, setNetwork] = useState("");
	const [onChainBalance, setOnChainBalance] = useState(0);

	useEffect(() => {
		const run = async () => {
			let onChainBalance = await get_total_onchain_balance();
			setOnChainBalance(onChainBalance);
			let res = await get_network();
			setNetwork(res);
		};
		run();
	}, [isNodeRunning]);

	useEffect(() => {
		const timer = setInterval(async () => {
			let res = await is_node_running();
			setIsNodeRunning(res);
		}, 3000);
		return () => clearInterval(timer);
	}, []);

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar color="transparent">
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						onClick={(_e) => {
							let newColor =
								boltColor == "inherit" ? "success" : "inherit";
							setBoltColor(newColor);
						}}
						aria-label="menu"
						sx={{ mr: 2 }}
					>
						<BoltIcon color="success" fontSize="large" />
					</IconButton>
					<Typography
						variant="h6"
						component="div"
						sx={{ flexGrow: 1 }}
					>
						LDK Node Desktop Manager
					</Typography>
					<div>
						<IconButton
							size="large"
							onClick={(_e) => start_node}
							color="inherit"
							disabled={isNodeRunning}
						>
							<DialogWindow
								buttonTitle={isNodeRunning ? "On" : "Start Node"}
								style={
									isNodeRunning
										? { ...buttonStyle, backgroundColor: "#dad7cd" }
										: buttonStyle
								}
								DialogView={StartNodeDialog}
							/>
						</IconButton>
						<IconButton size="large" color="inherit" disabled={true}>
							<Button
								style={{ ...buttonStyle, backgroundColor: "#dad7cd" }}
								variant="contained"
							>
								Network: {network}
							</Button>
						</IconButton>
						<IconButton
							color="inherit"
						>
							<Button
								style={{ ...buttonStyle, backgroundColor: "#dad7cd" }}
								variant="contained"
								disabled={true}
							>
								Unit: {bitcoinUnit}
							</Button>
						</IconButton>
						<IconButton
							color="inherit"
						>
							<Button
								style={{ ...buttonStyle, backgroundColor: "#dad7cd" }}
								variant="contained"
								disabled={true}
							>
								On Chain Balance: {onChainBalance}
							</Button>
						</IconButton>
					</div>
					<div>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							disabled={!isNodeRunning}
							aria-haspopup="true"
							onClick={sync_wallet}
							color="inherit"
						>
							<Button
								style={
									!isNodeRunning
										? {
												...buttonStyle,
												backgroundColor: "#dad7cd",
										  }
										: buttonStyle
								}
								variant="outlined"
							>
								Sync Wallet
							</Button>
						</IconButton>
					</div>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
