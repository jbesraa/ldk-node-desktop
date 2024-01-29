import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useState } from "react";
import { TextField } from "@mui/material";
import { useNodeContext } from "../../state/NodeContext";
import { GlobalButton } from "../../common";

interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
	walletName: string;
}

function ReceiveDialog(props: SimpleDialogProps) {
	const { new_onchain_address } = useNodeContext();
	const { onClose, selectedValue, open, walletName } = props;
	const [_, setAmount] = useState("");
	const [new_address, setNewAddress] = useState("");

	const title = "Receive";

	const handleClose = () => {
		setNewAddress("");
		onClose(selectedValue);
	};

	const new_onchain = async () => {
		if (!walletName) {
			console.log("wallet name is missing, receive dialog");
			return;
		}
		const res = await new_onchain_address(walletName);
		console.log("MEME111", res);
		setNewAddress(res);
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="lg"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>
				{title}
			</DialogTitle>
			<TextField
				value={walletName + "INACTIVE"}
				style={{
					margin: "1em",
					width: "50%",
					alignSelf: "center",
				}}
				onChange={(e: any) => {
					console.log(e.target.value);
					setAmount(e.target.value);
				}}
				disabled={true}
				label="Amount"
				variant="outlined"
			/>
			<TextField
				value={new_address}
				style={{
					margin: "1em",
					width: "50%",
					alignSelf: "center",
				}}
				label="On-Chain Address"
				variant="outlined"
			/>
			<GlobalButton
				onClick={new_onchain}
				title="Create New Address"
			/>
		</Dialog>
	);
}

export default ReceiveDialog;
