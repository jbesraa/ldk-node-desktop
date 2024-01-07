import { Button, Card, CardContent, Typography } from "@mui/material";
import { TitleCard } from "../../common";
import { useNodeContext } from "../../state/NodeContext";
import { useEffect, useState } from "react";

function HomeScreen() {
	// const [channelsCount, setChannelsCount] = useState(0);
	// const [totalOnChainBalance, setTotalOnChainBalance] = useState(0);
	// const [LDKBalance, setLDKBalance] = useState(0);
	// const {
	//     get_total_onchain_balance,
	//     list_channels,
	//     currentBlockHeight,
	// } = useNodeContext();

	// useEffect(() => {
	//     async function init() {
	//         const balance = await get_total_onchain_balance();
	//         const channels = await list_channels();
	//         const ldk_balance =  channels.reduce((acc, channel) => {
	//             return acc + channel.balance_msat;
	//         }, 0);
	//         setLDKBalance(ldk_balance);
	//         setChannelsCount(channels?.length);
	//         setTotalOnChainBalance(balance);
	//     }
	//     init();
	// }, [get_total_onchain_balance, list_channels]);

	return (
		<>
			<TitleCard title={"Dashboard"} value={"Hello Nakamoto"} />
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					gridGap: "1em",
				}}
			>
			</div>
		</>
	);
}

export default HomeScreen;
