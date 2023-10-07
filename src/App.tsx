import styled from "styled-components";
import { AppBar, SideBar } from "./common";
import { NodeContextProvider } from "./state/NodeContext";
import { Router, RouterContextProvider } from "./state/RouterContext";
import { Paper } from "@mui/material";
import { BitcoinContextProvider } from "./state/BitcoinContext";
import { attachConsole } from "tauri-plugin-log-api";
import { useEffect } from "react";

function App() {

    // with LogTarget::Webview enabled this function will print logs to the browser console
    useEffect(() => {
        attachConsole();
    }, []);

    return (
        <RouterContextProvider>
            <BitcoinContextProvider>
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
                                height: "90vh",
                                backgroundColor: "transparent",
                            }}
                        >
                                <SideBar />
                        </Paper>
                        <Wrapper>
                            <div
                                style={{
                                    height: "100vh",
                                }}
                            >
                                <Router />
                            </div>
                        </Wrapper>
                    </div>
                </NodeContextProvider>
            </BitcoinContextProvider>
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
