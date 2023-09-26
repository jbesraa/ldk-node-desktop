import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import BoltIcon from "@mui/icons-material/Bolt";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNodeContext } from "../NodeContext";
import { BitcoinUnit } from "../types";

const buttonStyle = {
	color: "#344e41",
	width: "100%",
	fontWeight: "600",
	backgroundColor: "#a3b18a",
};

export default function MenuAppBar() {
	const { start_node, is_node_running, get_network, bitcoinUnit, get_total_onchain_balance} =
		useNodeContext();
	const [boltColor, setBoltColor] = useState("inherit");
	const [isNodeRunning, setIsNodeRunning] = useState(false);
	const [network, setNetwork] = useState("");
	const [onChainBalance, setOnChainBalance] = useState(0);

	useEffect(() => {
		const run = async () => {
			let res = await get_network();
			setNetwork(res);
		};
		run();
	}, []);

	useEffect(() => {
		const timer = setInterval(async () => {
			let onChainBalance = await get_total_onchain_balance();
			setOnChainBalance(onChainBalance);
		}, 10000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const timer = setInterval(async () => {
			let res = await is_node_running();
			setIsNodeRunning(res);
		}, 3000);
		return () => clearInterval(timer);
	}, []);

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar color="transparent" position="static">
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
							onClick={start_node}
							color="inherit"
							disabled={isNodeRunning}
						>
							<Button
								style={
									isNodeRunning
										? { ...buttonStyle, backgroundColor: "#dad7cd" }
										: buttonStyle
								}
								variant="contained"
							>
								{isNodeRunning ? "ON" : "Start Node"}
							</Button>
						</IconButton>
						<IconButton size="large" color="inherit" disabled={true}>
							<Button style={buttonStyle} variant="contained">
								Network: {network}
							</Button>
						</IconButton>
						<IconButton disabled={true} onClick={start_node} color="inherit">
							<Button
								style={buttonStyle}
								variant="contained"
								disabled={true}
							>
								Unit: {bitcoinUnit}
							</Button>
						</IconButton>
						<IconButton disabled={true} onClick={start_node} color="inherit">
							<Button
								style={buttonStyle}
								variant="contained"
								disabled={true}
							>
								On Chain Balance: {onChainBalance} 
							</Button>
						</IconButton>
					</div>
					{false && (
						<div>
							<IconButton
								size="large"
								disabled={true}
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={() => {}}
								color="inherit"
							>
								<Button
									disabled={true}
									style={{
										...buttonStyle,
										backgroundColor: "#dad7cd",
									}}
									variant="outlined"
								>
									Sync Wallet
								</Button>
							</IconButton>
						</div>
					)}
				</Toolbar>
			</AppBar>
		</Box>
	);
}
