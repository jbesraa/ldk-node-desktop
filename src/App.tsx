import styled from "styled-components";
import OurNodeInfo from "./NodeData";
import PeersTable from "./PeersTable";
import DialogWindow from "./Dialog";
import {
	ConnectToPeerDialog,
	CreateInvoiceDialog,
	OpenChannelDialog,
	PayInvoiceDialog,
} from "./DialogViews";
import MenuAppBar from "./AppBar";
import { NodeContextProvider } from "./NodeContext";

function App() {
	return (
		<NodeContextProvider>
		<Wrapper>
			<MenuAppBar />
			<div
				style={{
					gridGap: "0.8em",
					paddingTop: "2em",
					display: "grid",
					gridTemplateColumns: "1.2fr 1fr",
				}}
			>
				<OurNodeInfo />
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
						buttonTitle="CreateInvoice"
						DialogView={CreateInvoiceDialog}
					/>
				</div>
			</div>
			<PeersTable />
			{/**isNodeRunning ? (
				<>
					<div style={{ paddingTop: "4em" }}>
						<InfoItemTitle>Peers</InfoItemTitle>
						<PeersHorizontalCardView peers={peers} />
					</div>
					<div style={{ paddingTop: "4em" }}>
						<InfoItemTitle>Channels</InfoItemTitle>
						<ChannelsHorizontalCardView
							channels={channels}
						/>
					</div>
				</>
			) : (
				<></>
			)**/}
		</Wrapper>
	</NodeContextProvider>
	);
}

const Wrapper = styled.div`
	margin-top: 1em;
	margin-left: 8em;
	margin-right: 8em;
	height: 100vh;
`;

export default App;
