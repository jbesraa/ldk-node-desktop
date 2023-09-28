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
	totalChannelsValueSat: number;
}

function OurNodeStats() {
	const { list_channels, is_node_running, convert_to_current_unit} = useNodeContext();
	const [stats, setStats] = useState<OurNodeStatRows>({} as OurNodeStatRows);

	useEffect(() => {
		const init = async () => {
			let isNodeRunning = await is_node_running();
			if (!isNodeRunning) return;
			let channels = await list_channels();
			let totalInboundCapcityMSat = channels.reduce((acc, curr) => acc + curr.inbound_capacity_msat, 0);
			let totalBalanceMSat = channels.reduce((acc, curr) => acc + curr.balance_msat, 0);
			let totalOutboundCapcityMSat = channels.reduce((acc, curr) => acc + curr.outbound_capacity_msat, 0);
			let totalChannelsValueSat = channels.reduce((acc, curr) => acc + curr.channel_value_sats, 0);

			setStats({
				totalInboundCapcityMSat,
				totalBalanceMSat,
				totalOutboundCapcityMSat,
				totalChannelsValueSat,
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
		minWidth: 275,
		color: "#344e41",
		backgroundColor: "#dad7cd",
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
				paddingTop: "1em",
				gridGap: "1em",
			}}
		>
			<Card sx={CardStyle} >
				<CardContent>
					<Typography sx={CardItemTitleStyle} color="text.secondary">
						Total Balance Across Channels
					</Typography>
					<Typography sx={CardItemValueStyle} color="text.secondary">
						{convert_to_current_unit(stats.totalBalanceMSat, BitcoinUnit.MillionthSatoshis)}
					</Typography>
				</CardContent>
			</Card>
			<Card sx={CardStyle} >
				<CardContent>
					<Typography sx={CardItemTitleStyle} color="text.secondary">
						Total Inbound Liquidity
					</Typography>
					<Typography sx={CardItemValueStyle} color="text.secondary">
						{convert_to_current_unit(stats.totalInboundCapcityMSat, BitcoinUnit.MillionthSatoshis)}
					</Typography>
				</CardContent>
			</Card>
			<Card sx={CardStyle} >
				<CardContent>
					<Typography sx={CardItemTitleStyle} color="text.secondary">
						Total Outbound Liquidity 
					</Typography>
					<Typography sx={CardItemValueStyle} color="text.secondary">
						{convert_to_current_unit(stats.totalOutboundCapcityMSat, BitcoinUnit.MillionthSatoshis)}
					</Typography>
				</CardContent>
			</Card>
			<Card
				sx={CardStyle}
			>
				<CardContent>
					<Typography sx={CardItemTitleStyle} color="text.secondary">
						Total Channels Value
					</Typography>
					<Typography sx={CardItemValueStyle} color="text.secondary">
						{convert_to_current_unit(stats.totalChannelsValueSat, BitcoinUnit.Satoshis)}
					</Typography>
				</CardContent>
			</Card>
		</div>
	);
}

export default OurNodeStats;
