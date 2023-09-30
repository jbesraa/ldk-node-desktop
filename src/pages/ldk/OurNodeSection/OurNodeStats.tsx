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
}

function OurNodeStats() {
	const {
		list_channels,
		is_node_running,
		convert_to_current_unit,
		bitcoinUnit,
	} = useNodeContext();
	const [stats, setStats] = useState<OurNodeStatRows>(
		{} as OurNodeStatRows
	);

	useEffect(() => {
		const init = async () => {
			let isNodeRunning = await is_node_running();
			if (!isNodeRunning) return;
			let channels = await list_channels();
			let totalInboundCapcityMSat = channels.reduce(
				(acc, curr) =>
					acc +
					curr.inbound_capacity_msat,
				0
			);
			let totalBalanceMSat = channels.reduce(
				(acc, curr) =>
					acc + curr.balance_msat,
				0
			);
			let totalOutboundCapcityMSat =
				channels.reduce(
					(acc, curr) =>
						acc +
						curr.outbound_capacity_msat,
					0
				);

			setStats({
				totalInboundCapcityMSat,
				totalBalanceMSat,
				totalOutboundCapcityMSat,
			});
		};

		const timer = setInterval(async () => {
			init();
		}, 5000);

		return () => {
			clearInterval(timer);
		};
	}, [list_channels]);

	const CardStyle = {
		width: 323,
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
				gridTemplateColumns: "1fr 1fr 1fr",
				paddingTop: "1em",
				gridGap: "1em",
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
						variant="h3"
						sx={
							CardItemValueStyle
						}
						color="white"
					>
						{convert_to_current_unit(
							stats.totalBalanceMSat,
							BitcoinUnit.MillionthSatoshis
						) || 0}{" "}
						{bitcoinUnit}
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
						variant="h3"
						sx={
							CardItemValueStyle
						}
						color="white"
					>
						{convert_to_current_unit(
							stats.totalInboundCapcityMSat,
							BitcoinUnit.MillionthSatoshis
						) || 0}{" "}
						{bitcoinUnit}
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
						variant="h3"
						color="white"
					>
						{convert_to_current_unit(
							stats.totalOutboundCapcityMSat,
							BitcoinUnit.MillionthSatoshis
						) || 0}{" "}
						{bitcoinUnit}
					</Typography>
				</CardContent>
			</Card>
		</div>
	);
}

export default OurNodeStats;
