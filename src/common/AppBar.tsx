import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import BoltIcon from "@mui/icons-material/Bolt";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNodeContext } from "../NodeContext";

const buttonStyle = {
	color: "#344e41",
	width: "100%",
	fontWeight: "600",
	backgroundColor: "#a3b18a",
};

export default function MenuAppBar() {
	const { start_node, is_node_running } = useNodeContext();
	const [boltColor, setBoltColor] = useState("inherit");
	const [isNodeRunning, setIsNodeRunning] = useState(false);

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
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
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
								{isNodeRunning ? "ON" : "Start Node" }
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
