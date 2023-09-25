import styled from "styled-components";
import { AppBar } from "./common";
import { NodeContextProvider } from "./NodeContext";
import OurNodeSection from "./OurNodeSection";
import PeersTable from "./PeersSection";
import ChannelsSection from "./ChannelsSection";

function App() {
	return (
		<NodeContextProvider>
			<Wrapper>
				<AppBar />
				<OurNodeSection />
				<PeersTable />
				<ChannelsSection />
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
