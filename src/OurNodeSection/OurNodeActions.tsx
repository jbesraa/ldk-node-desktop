import { CreateInvoiceDialog, OpenChannelDialog, ConnectToPeerDialog, PayInvoiceDialog } from "./Actions";
import { DialogWindow } from "../common";

function OurNodeActions() {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr",
				gridGap: "0.2em",
				backgroundColor: "inherit",
			}}
		>
			<DialogWindow
				buttonTitle="Open Channel"
				DialogView={OpenChannelDialog}
			/>
			<DialogWindow
				buttonTitle="Connect To Peer"
				DialogView={ConnectToPeerDialog}
			/>
			<DialogWindow
				buttonTitle="Pay Invoice"
				DialogView={PayInvoiceDialog}
			/>
			<DialogWindow
				buttonTitle="Create Invoice"
				DialogView={CreateInvoiceDialog}
			/>
		</div>
	);
}

export default OurNodeActions;
