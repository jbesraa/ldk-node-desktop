import { Card, CardContent, Typography } from "@mui/material";

function DashboardScreenCard({
    title,
    value,
}: {
    title: string;
    value: string | number;
}) {
    const CardStyle = {
        minWidth: 265,
        minHeight: "20vh",
        color: "#344e41",
        backgroundColor: "#dad7cd",
    };

    return (
        <Card sx={CardStyle}>
            <CardContent>
                <Typography variant="overline" color="text.secondary">
                    {title}
                </Typography>
                <Typography variant="h2" color="black">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

function DashboardScreen() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gridGap: "1em",
            }}
        >
            <DashboardScreenCard
                title={"Dashboard"}
                value={"Value"}
            />
        </div>
    );
}

export default DashboardScreen;
