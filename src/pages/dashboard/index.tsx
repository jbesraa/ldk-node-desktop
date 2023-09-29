import { Card, CardContent, Typography } from "@mui/material";
import { TitleCard } from "../../common";

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
        color: "white",
        backgroundColor: "#344e41",
    };

    return (
        <Card sx={CardStyle}>
            <CardContent>
                <Typography variant="overline" color="gray">
                    {title}
                </Typography>
                <Typography variant="h2" color="white">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

function DashboardScreen() {
    return (
        <>
            <TitleCard 
                title={"Dashboard"}
                value={"Hello Nakamoto"}
            />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gridGap: "1em",
                }}
            >
                <DashboardScreenCard
                    title={"Block"}
                    value={"242595"}
                />
                <DashboardScreenCard
                    title={"On Chain Balance"}
                    value={"21 BTC"}
                />
                <DashboardScreenCard
                    title={"LDK Balance"}
                    value={"0.5 BTC"}
                />
                <DashboardScreenCard
                    title={"Open LDK Channels"}
                    value={"21"}
                />
                <DashboardScreenCard
                    title={"Fees Earned 24h"}
                    value={"0.5 BTC"}
                />
            </div>
        </>
    );
}

export default DashboardScreen;
