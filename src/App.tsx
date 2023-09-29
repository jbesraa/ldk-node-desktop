import styled from "styled-components";
import { AppBar, SideBar } from "./common";
import { NodeContextProvider } from "./state/NodeContext";
import { Router, RouterContextProvider } from "./state/RouterContext";
import { Paper } from "@mui/material";

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
                    <Paper
                        style={{
                            width: 200,
                            maxHeight: "90vh",
                            backgroundColor: "transparent",
                        }}
                    >
                        <div style={{ height: "50vh" }}>
                            <SideBar />
                        </div>
                    </Paper>
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
    margin-left: 6em;
    margin-right: 8em;
    height: 90vh;
    overflow: hidden;
`;

export default App;
