import styled from "styled-components";
import { AppBar, SideBar } from "./common";
import { NodeContextProvider } from "./state/NodeContext";
import { Router, RouterContextProvider } from "./state/RouterContext";

function App() {
    return (
        <RouterContextProvider>
            <NodeContextProvider>
                <AppBar />
                <br />
                <br />
                <br />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 7fr",
                    }}
                >
                    <SideBar />
                    <Wrapper>
                        <div
                            style={{
                                height: "100vh",
                                overflow: "scroll",
                            }}
                        >
                            <Router />
                        </div>
                    </Wrapper>
                </div>
            </NodeContextProvider>
        </RouterContextProvider>
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
