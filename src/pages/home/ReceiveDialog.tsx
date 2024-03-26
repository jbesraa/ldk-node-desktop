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
	const { new_onchain_address, create_bolt12_offer } = useNodeContext();
	const { onClose, selectedValue, open, walletName } = props;
	const [new_address, setNewAddress] = useState("");
	const [offer, setOffer] = useState("");

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

	const new_offer = async () => {
		if (!walletName) {
			console.log("wallet name is missing, receive dialog");
			return;
		}
		const res = await create_bolt12_offer(walletName);
		console.log("here0101", res);
		setOffer(res);
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
				value={new_address}
				style={{
					margin: "1em",
					width: "50%",
					alignSelf: "center",
				}}
				label="On-Chain Address"
				variant="outlined"
			/>
			<TextField
				value={offer}
				style={{
					margin: "1em",
					width: "50%",
					alignSelf: "center",
				}}
				label="Offer"
				variant="outlined"
			/>
			<GlobalButton
				onClick={new_onchain}
				title="Create New Address"
			/>
			<div>
			</div>
			<GlobalButton
				onClick={new_offer}
				title="Create New Offer"
			/>
		</Dialog>
	);
}

export default ReceiveDialog;
