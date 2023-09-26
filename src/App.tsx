import styled from "styled-components";
import { AppBar } from "./common";
import { NodeContextProvider } from "./NodeContext";
import OurNodeSection from "./OurNodeSection";
import PeersTable from "./PeersSection";
import ChannelsSection from "./ChannelsSection";
import PaymentsSection from "./PaymentsSection";

function App() {
	return (
		<NodeContextProvider>
			<Wrapper>
				<AppBar />
				<br />
				<br />
				<br />
				<div style={{ height: "100vh", overflow: "scroll" }}>
					<OurNodeSection />
					<PeersTable />
					<ChannelsSection />
					<PaymentsSection />
				</div>
			</Wrapper>
		</NodeContextProvider>
	);
}

const Wrapper = styled.div`
	margin-top: 1em;
	margin-left: 8em;
	margin-right: 8em;
	height: 100vh;
	overflow: hidden;
`;

export default App;
