import { Card, CardContent, Paper, Typography } from "@mui/material";
import { useRouterContext } from "../state/RouterContext";

function SideBarCard({
    title,
    path,
}: {
    title: string;
    path: string;
}) {
    const { current_route, push_route } = useRouterContext();
    const isSelected = path === current_route;
    const CardStyle = {
        backgroundColor: "transparent",
        // backgroundColor: isSelected ?  "#a3b18a" : "transparent",
        // backgroundColor: isSelected ? "#344e41" : "#a3b18a",
        border: 0,
        width: 200,
        boxShadow: 0,
        borderRadius:0,
        cursor: "pointer",
    };

    const TitleStyle = {
          fontSize: "1.4em",
          // textDecoration: isSelected ? "underline"  : "none"
    }

    return (
        <Card sx={CardStyle} onClick={() => push_route(path)}>
            <CardContent>
                <Typography
                    align="center"
                    style={TitleStyle}
                    variant="body2"
                    color={isSelected ?  "#344e41" : "#a3b18a" }
                >
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
}

function SideBar() {
    return (
        <div style={{ display: "grid" }}>
            <SideBarCard title={"Dashboard"} path="dashboard" />
            <SideBarCard title={"Bitcoin"} path="bitcoin" />
            <SideBarCard title={"LDK"} path="ldk" />
            <SideBarCard title={"Settings"} path="settings" />
        </div>
    );
}

export default SideBar;
