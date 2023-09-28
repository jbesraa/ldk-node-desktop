import { Card, CardContent, Typography } from "@mui/material";
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
        width: 140,
        maxHeight: 120,
        color: "#344e41",
        backgroundColor: !isSelected ? "#dad7cd" : "white",
        boxShadow: 8,
        borderRadius: 5,
        cursor: "pointer",
    };

    return (
        <Card sx={CardStyle} onClick={() => push_route(path)}>
            <CardContent>
                <Typography
                    align="center"
                    style={{ fontSize: "1.4em" }}
                    variant="caption"
                    color="text.secondary"
                >
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
}

function SideBar() {
    return (
        <div style={{ display: "grid", maxHeight: 400 }}>
            <SideBarCard title={"Dashboard"} path="dashboard" />
            <SideBarCard title={"Bitcoin"} path="bitcoin" />
            <SideBarCard title={"LDK"} path="ldk" />
        </div>
    );
}

export default SideBar;
