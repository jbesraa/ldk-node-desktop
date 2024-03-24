import styled from "styled-components";
import { AppBar } from "./common";
import { NodeContextProvider } from "./state/NodeContext";
import { Router, RouterContextProvider } from "./state/RouterContext";
import { BitcoinContextProvider } from "./state/BitcoinContext";
import { attachConsole } from "tauri-plugin-log-api";
import { useEffect } from "react";
import { createTheme, ThemeProvider  } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: "#344e41",
        },
        secondary: {
            main: "#a3b18a",
        },
    },
});

function App() {
    // with LogTarget::Webview enabled this function will print logs to the browser console
    useEffect(() => {
        attachConsole();
    }, []);

    return (
        <RouterContextProvider>
            <BitcoinContextProvider>
                <NodeContextProvider>
                <ThemeProvider theme={theme}>
                    <Wrapper>
                        <Router />
                    </Wrapper>
                    </ThemeProvider>
                </NodeContextProvider>
            </BitcoinContextProvider>
        </RouterContextProvider>
    );
}

const Wrapper = styled.div`
    padding-top: 2em;
`;

export default App;
