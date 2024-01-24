import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { Button } from "@mui/material";
import { useNodeContext } from "../../state/NodeContext";

interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
	walletName: string;
}

function StopNodeDialog(props: SimpleDialogProps) {
	const { stop_node } = useNodeContext();
	const { onClose, selectedValue, open, walletName } = props;
	console.log(walletName);

	const title = "Stop Node";

	const handleClose = () => {
		onClose(selectedValue);
	};

	const new_onchain = async () => {
		if (!walletName) {
			console.log("wallet name is missing, stop node dialog");
			return;
		}
		const res = await stop_node(walletName);
		console.log(res);
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
			<Button color="warning" onClick={new_onchain}>Stop Node</Button>
		</Dialog>
	);
}

export default StopNodeDialog;
