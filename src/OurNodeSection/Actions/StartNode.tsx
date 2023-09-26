import * as React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { Snackbar } from "../../common";
import { useNodeContext } from "../../NodeContext";
import { Network, StartNodeInput } from "../../types";

const buttonStyle = {
	color: "#344e41",
	fontSize: "1em",
	width: "100%",
	fontWeight: "600",
	backgroundColor: "#a3b18a",
};

export interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
}

function StartNodeDialog(props: SimpleDialogProps) {
	const { start_node } = useNodeContext();
	const { onClose, selectedValue, open } = props;
	const [network] = React.useState(Network.Testnet);
	const [storageDir, setStorageDir] = React.useState(
		"/home/ecode/ldk-keys"
	);
	const [listeningAddress, setListeningAddress] =
		React.useState("0.0.0.0:9735");
	const [esploraAddress, setEsploraAddress] = React.useState(
		"https://blockstream.info/testnet/api/"
	);
	const [message, setMessage] = React.useState("");
	const [isSnackbarOpen, setIssnackbarOpen] = React.useState(false);

	async function start() {
		try {
			if (network != Network.Testnet && network != Network.Bitcoin) {
				console.log("invalid network");
			}
			const data: StartNodeInput = {
				network,
				storageDir,
				listeningAddress,
				esploraAddress,
			};
			const res = await start_node(data);
			if (res) {
				setMessage("Successfully connected to peer");
			}
			setMessage(String(res));
			setIssnackbarOpen(true);
			// handleClose();
		} catch (e) {
			console.log(e);
			setMessage(String(e));
			setIssnackbarOpen(true);
		}
	}

	React.useEffect(() => {
		return () => setIssnackbarOpen(false);
	}, []);

	const title = "Connect To Peer";

	const handleClose = () => {
		onClose(selectedValue);
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="lg"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>
			<List sx={{ p: 6 }}>
				<ListItem disableGutters>
					<TextField
						disabled={true}
						value={network}
						style={{ width: "100%" }}
						label="Network"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={storageDir}
						onChange={(e) => setStorageDir(e.target.value)}
						style={{ width: "100%" }}
						label="Storage Directory"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={listeningAddress}
						onChange={(e) => setListeningAddress(e.target.value)}
						style={{ width: "100%" }}
						label="Listening Address"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<TextField
						value={esploraAddress}
						onChange={(e) => setEsploraAddress(e.target.value)}
						style={{ width: "100%" }}
						label="Esplora Address"
						variant="outlined"
					/>
				</ListItem>
				<ListItem disableGutters>
					<Button
						style={buttonStyle}
						variant="contained"
						onClick={start}
					>
						Start
					</Button>
					<Snackbar
						message={message}
						open={isSnackbarOpen}
						setOpen={setIssnackbarOpen}
					/>
				</ListItem>
			</List>
		</Dialog>
	);
}

export default StartNodeDialog;
