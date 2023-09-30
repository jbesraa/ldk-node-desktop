import { Card, CardContent, Typography } from "@mui/material";
import { TitleCard } from "../../common";
import { useBitcoinContext } from "../../state/BitcoinContext";
import { useNodeContext } from "../../state/NodeContext";
import { useEffect, useState } from "react";

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
    const [channelsCount, setChannelsCount] = useState(0);
    const [totalOnChainBalance, setTotalOnChainBalance] = useState(0);
    const [currentBlockHeight, setCurrentBlockHeight] = useState(0);
    const { get_total_onchain_balance, list_channels } = useNodeContext();
    const { currentBlock } = useBitcoinContext();

    useEffect(() => {
            async function init() {
                const balance = await get_total_onchain_balance();
                const channels = await list_channels();
                const blockHeight = await currentBlock();
                setChannelsCount(channels?.length)
                setCurrentBlockHeight(blockHeight)
                setTotalOnChainBalance(balance)
            }
            init()

            }, [get_total_onchain_balance, list_channels, currentBlock])

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
                    value={currentBlockHeight}
                />
                <DashboardScreenCard
                    title={"On Chain Balance"}
                    value={totalOnChainBalance}
                />
                <DashboardScreenCard
                    title={"LDK Balance"}
                    value={"?"}
                />
                <DashboardScreenCard
                    title={"Open LDK Channels"}
                    value={channelsCount}
                />
                <DashboardScreenCard
                    title={"Fees Earned 24h"}
                    value={"?"}
                />
            </div>
        </>
    );
}

export default DashboardScreen;
