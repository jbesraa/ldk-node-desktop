import { Card, CardContent, Typography } from "@mui/material";
import { TitleCard } from "../../common";
import { useNodeContext } from "../../state/NodeContext";

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

function BitcoinScreen() {
    const { bitcoinUnit } = useNodeContext();

    return (
        <>
        <TitleCard
            title="Bitcoin"
            value="Running"
        />
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gridGap: "1em",
            }}
        >
            <BitcoinScreenCard title={"Balance"} value={`21 ${bitcoinUnit}`} />
            <BitcoinScreenCard title={"Sync"} value={"100%"} />
        </div>
    </>
    );
}

export default BitcoinScreen;
