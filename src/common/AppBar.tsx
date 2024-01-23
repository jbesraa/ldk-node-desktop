import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import BoltIcon from "@mui/icons-material/Bolt";
import { useState } from "react";

export default function MenuAppBar() {
    const [boltColor, setBoltColor] = useState<string>("success");

    return (
        <Box sx={{ flexGrow: 1, boxShadow: "none" }}>
            <AppBar color="transparent" sx={{ boxShadow: "none" }}>
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
                            color={"success"}
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
                </Toolbar>
            </AppBar>
        </Box>
    );
}
