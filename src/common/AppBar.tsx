import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import BoltIcon from "@mui/icons-material/Bolt";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNodeContext } from "../state/NodeContext";
import DialogWindow from "./Dialog";
import StartNodeDialog from "../pages/ldk/OurNodeSection/Actions/StartNode";

const buttonStyle = {
    color: "white",
    width: "100%",
    fontWeight: "600",
    backgroundColor: "#344e41",
};

export default function MenuAppBar() {
    const { start_node, is_node_running, get_network, bitcoinUnit } =
        useNodeContext();
    const [boltColor, setBoltColor] = useState<string>("success");
    const [isNodeRunning, setIsNodeRunning] = useState(false);
    const [network, setNetwork] = useState("");

    useEffect(() => {
        const run = async () => {
            let res = await get_network();
            setNetwork(res);
        };
        run();
    }, [isNodeRunning]);

    useEffect(() => {
        const timer = setInterval(async () => {
            let res = await is_node_running();
            setIsNodeRunning(res);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar color="transparent">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="success"
                        onClick={(_e) => {
                            let newColor =
                                boltColor == "inherit"
                                    ? "success"
                                    : "inherit";
                            setBoltColor(newColor);
                        }}
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <BoltIcon
                            color={boltColor}
                            fontSize="large"
                        />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        color="#344e41"
                        sx={{ flexGrow: 1 }}
                    >
                        0shi 
                    </Typography>
                    <div>
                        <IconButton
                            size="large"
                            onClick={(_e) => start_node}
                            color="inherit"
                            disabled={isNodeRunning}
                        >
                            <DialogWindow
                                buttonTitle={
                                    isNodeRunning
                                        ? "On"
                                        : "Start LDK Node"
                                }
                                style={
                                    isNodeRunning
                                        ? {
                                              ...buttonStyle,
                                              backgroundColor:
                                                  "#dad7cd",
                                          }
                                        : buttonStyle
                                }
                                DialogView={StartNodeDialog}
                            />
                        </IconButton>
                        <IconButton
                            size="large"
                            color="inherit"
                            disabled={true}
                        >
                            <Button
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: "#344e41",
                                }}
                                variant="contained"
                            >
                                Network: {network}
                            </Button>
                        </IconButton>
                        <IconButton
                            color="inherit"
                            size="large"
                            disabled={true}
                        >
                            <Button
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: "#344e41",
                                }}
                                variant="contained"
                                disabled={true}
                            >
                                Unit: {bitcoinUnit}
                            </Button>
                        </IconButton>
                        <IconButton
                            color="inherit"
                            size="large"
                            disabled={true}
                        >
                            <Button
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: "#344e41",
                                }}
                                variant="contained"
                                disabled={true}
                            >
                                Block: 252494
                            </Button>
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

// const MenuItems = () => {
//     return (
// 					<div>
// 						<IconButton
// 							size="large"
// 							aria-label="account of current user"
// 							aria-controls="menu-appbar"
// 							disabled={!isNodeRunning}
// 							aria-haspopup="true"
// 							onClick={sync_wallet}
// 							color="inherit"
// 						>
// 							<Button
// 								style={
// 									!isNodeRunning
// 										? {
// 												...buttonStyle,
// 												backgroundColor: "#dad7cd",
// 										  }
// 										: buttonStyle
// 								}
// 								variant="outlined"
// 							>
// 								Sync Wallet
// 							</Button>
// 						</IconButton>
// 					</div>

//            )
// }
