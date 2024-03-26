import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import { TextField } from "@mui/material";
import { useBitcoinContext } from "../../state/BitcoinContext";
import { CreateWalletInput } from "../../types";
import { GlobalButton } from "../../common";

interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
}

function CreateBitcoinWalletDialog(props: SimpleDialogProps) {
	const { create_wallet } = useBitcoinContext();
	const { onClose, selectedValue, open } = props;
	const [walletName, setWalletName] = useState("");
	const [listeningAddress, setListeningAddress] = useState("0.0.0.0:9735");
	const [esploraAddress, setEsploraAddress] = useState(
		"https://mutinynet.com/api"
	);

	async function createWallet() {
		try {
			const data: CreateWalletInput = {
				walletName,
				listeningAddress,
				esploraAddress,
			};
			const res = await create_wallet(data);
			console.log(res);
			handleClose();
		} catch (e) {
			console.log(e);
		}
	}

	const title = "New Node";

	const handleClose = () => {
		setWalletName("");
		onClose(selectedValue);
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="sm"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr",
					gap: "2em",
					justifyItems: "center",
				}}
			>
				<TextField
					value={walletName}
					style={{
						width: "50%",
						alignSelf: "center",
					}}
					onChange={(e: any) => {
						console.log(e.target.value);
						setWalletName(e.target.value);
					}}
					label="Node Name"
					variant="outlined"
				/>
				<TextField
					value={listeningAddress}
					onChange={(e) => setListeningAddress(e.target.value)}
					style={{ width: "50%" }}
					label="Listening Address"
					variant="outlined"
				/>
				<TextField
					value={esploraAddress}
					onChange={(e) => setEsploraAddress(e.target.value)}
					style={{ width: "50%" }}
					label="Esplora Address"
					variant="outlined"
				/>
				<div style={{ width: "50%", paddingBottom: "1em" }}>
					<GlobalButton onClick={createWallet} title="Create" />
				</div>
			</div>
		</Dialog>
	);
}

export default CreateBitcoinWalletDialog;
