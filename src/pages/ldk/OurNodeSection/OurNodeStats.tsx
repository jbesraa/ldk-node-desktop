import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNodeContext } from "../../../state/NodeContext";
import { BitcoinUnit } from "../../../types";

interface OurNodeStatRows {
	totalInboundCapcityMSat: number;
	totalBalanceMSat: number;
	totalOutboundCapcityMSat: number;
	totalOnChainBalance: number;
}

function OurNodeStats() {
	const {
		list_channels,
		is_node_running,
		convert_to_current_unit,
		bitcoinUnit,
		get_total_onchain_balance,
	} = useNodeContext();
	const [stats, setStats] = useState<OurNodeStatRows>(
		{} as OurNodeStatRows
	);

	// useEffect(() => {
	// 	const init = async () => {
	// 		let isNodeRunning = await is_node_running();
	// 		if (!isNodeRunning) return;
	// 		let channels = await list_channels();
	// 		let totalInboundCapcityMSat = channels.reduce(
	// 			(acc, curr) =>
	// 				acc +
	// 				curr.inbound_capacity_msat,
	// 			0
	// 		);
	// 		let totalBalanceMSat = channels.reduce(
	// 			(acc, curr) =>
	// 				acc + curr.balance_msat,
	// 			0
	// 		);
	// 		let totalOutboundCapcityMSat =
	// 			channels.reduce(
	// 				(acc, curr) =>
	// 					acc +
	// 					curr.outbound_capacity_msat,
	// 				0
	// 			);

	// 		let on_chain_balance = await get_total_onchain_balance();
	// 		setStats({
	// 			totalInboundCapcityMSat,
	// 			totalBalanceMSat,
	// 			totalOutboundCapcityMSat,
	// 			totalOnChainBalance: on_chain_balance,
	// 		});
	// 	};

	// 	const timer = setInterval(async () => {
	// 		init();
	// 	}, 10000);

	// 	return () => {
	// 		clearInterval(timer);
	// 	};
	// }, [list_channels]);

	const CardStyle = {
		height: 143,
		backgroundColor: "#344e41",
	};

	const CardItemTitleStyle = {
		textAlign: "center",
	};

	const CardItemValueStyle = {
		textAlign: "center",
		mb: 1.5,
	};

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr 1fr 1fr",
				paddingTop: "0.4em",
				gridGap: "0.4em",
			}}
		>
			<Card sx={CardStyle}>
				<CardContent>
					<Typography
						sx={
							CardItemTitleStyle
						}
						color="gray"
					>
						Total Balance Across
						Channels
					</Typography>
					<Typography
						variant="h4"
						sx={
							CardItemValueStyle
						}
						color="white"
					>
						{convert_to_current_unit(
							stats.totalBalanceMSat,
							BitcoinUnit.MillionthSatoshis
						) || 0}
						{` ${bitcoinUnit}`}
					</Typography>
				</CardContent>
			</Card>
			<Card sx={CardStyle}>
				<CardContent>
					<Typography
						sx={
							CardItemTitleStyle
						}
						color="gray"
					>
						Total Inbound
						Liquidity
					</Typography>
					<Typography
						variant="h4"
						sx={
							CardItemValueStyle
						}
						color="white"
					>
						{convert_to_current_unit(
							stats.totalInboundCapcityMSat,
							BitcoinUnit.MillionthSatoshis
						) || 0}
						{` ${bitcoinUnit}`}
					</Typography>
				</CardContent>
			</Card>
			<Card sx={CardStyle}>
				<CardContent>
					<Typography
						sx={
							CardItemTitleStyle
						}
						color="gray"
					>
						Total Outbound
						Liquidity
					</Typography>
					<Typography
						sx={
							CardItemValueStyle
						}
						variant="h4"
						color="white"
					>
						{convert_to_current_unit(
							stats.totalOutboundCapcityMSat,
							BitcoinUnit.MillionthSatoshis
						) || 0}
						{` ${bitcoinUnit}`}
					</Typography>
				</CardContent>
			</Card>
			<Card sx={CardStyle}>
				<CardContent>
					<Typography
						sx={
							CardItemTitleStyle
						}
						color="gray"
					>
						Total On-Chain
						Balance
					</Typography>
					<Typography
						sx={
							{...CardItemValueStyle, justifySelf: "end" }
						}
						variant="h4"
						color="white"
					>
						{convert_to_current_unit(
							stats.totalOnChainBalance,
							BitcoinUnit.Satoshis
						) || 0}
						{` ${bitcoinUnit}`}
					</Typography>
				</CardContent>
			</Card>
		</div>
	);
}

export default OurNodeStats;
