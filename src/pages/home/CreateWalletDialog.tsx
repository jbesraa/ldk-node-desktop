import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import { Button, TextField } from "@mui/material";
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
	const [mnemonic, setMnemonic] = useState("");
	const [walletName, setWalletName] = useState("");
	const [listeningAddress, setListeningAddress] =
		useState("0.0.0.0:9735");
	const [esploraAddress, setEsploraAddress] = useState(
		"https://5b9c-46-116-218-230.ngrok-free.app"
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
			if (res) {
				setMnemonic(res);
			}
			// handleClose();
		} catch (e) {
			console.log(e);
		}
	}

	const title = "New Wallet";

	const handleClose = () => {
		setMnemonic("");
		setWalletName("");
		onClose(selectedValue);
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="lg"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>
				{mnemonic.length
					? `Wallet ${walletName} Created!`
					: title}
			</DialogTitle>
			{!mnemonic.length && (
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
						label="Wallet Name"
						variant="outlined"
					/>
					<TextField
						value={listeningAddress}
						onChange={(e) =>
							setListeningAddress(e.target.value)
						}
						style={{ width: "50%" }}
						label="Listening Address"
						variant="outlined"
					/>
					<TextField
						value={esploraAddress}
						onChange={(e) =>
							setEsploraAddress(e.target.value)
						}
						style={{ width: "50%" }}
						label="Esplora Address"
						variant="outlined"
					/>
				</div>
			)}
			{mnemonic.length ? (
				<p style={{ textAlign: "center" }}>
					Your wallet mnemonic is presented below
				</p>
			) : null}
			{mnemonic.length ? (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr",
					}}
				>
					{mnemonic.split(" ").map((word: string) => {
						return (
							<Button
								disabled={true}
								variant="contained"
								sx={{
									margin: 1,
									fontSize: "28px",
								}}
							>
								{word}
							</Button>
						);
					})}
				</div>
			) : null}
			{!mnemonic.length ? (
				<GlobalButton disabled={!walletName.length} onClick={createWallet} title="Send" />
			) : (
				<GlobalButton  onClick={handleClose} title="Done" />
			)}
		</Dialog>
	);
}

export default CreateBitcoinWalletDialog;
