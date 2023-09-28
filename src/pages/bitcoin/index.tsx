import { Card, CardContent, Typography } from "@mui/material";

function BitcoinScreenCard({
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

function BitcoinScreen() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gridGap: "1em",
            }}
        >
            <BitcoinScreenCard
                title={"Current Block"}
                value={"123456678"}
            />
            <BitcoinScreenCard title={"Balance"} value={"21 BTC"} />
            <BitcoinScreenCard title={"Sync"} value={"100%"} />
        </div>
    );
}

export default BitcoinScreen;
