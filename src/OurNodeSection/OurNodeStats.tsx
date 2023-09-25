import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

function OurNodeStats() {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr 1fr 1fr",
				paddingTop: "1em",
				gridGap: "1em",
			}}
		>
			<Card
				sx={{
					minWidth: 275,
					color: "#344e41",
					backgroundColor: "#dad7cd",
				}}
			>
				<CardContent>
					<Typography sx={{ mb: 1.5 }} color="text.secondary">
						Total Balance Across Channels: 1000 Satoshis
					</Typography>
				</CardContent>
			</Card>
			<Card
				sx={{
					minWidth: 275,
					color: "#344e41",
					backgroundColor: "#dad7cd",
				}}
			>
				<CardContent>
					<Typography sx={{ mb: 1.5 }} color="text.secondary">
						Total Inbound Liquidity: 1000 Satoshis
					</Typography>
				</CardContent>
			</Card>
			<Card
				sx={{
					minWidth: 275,
					color: "#344e41",
					backgroundColor: "#dad7cd",
				}}
			>
				<CardContent>
					<Typography sx={{ mb: 1.5 }} color="text.secondary">
						Total Outbound Liquidity: 1000 Satoshis
					</Typography>
				</CardContent>
			</Card>
			<Card
				sx={{
					minWidth: 275,
					color: "#344e41",
					backgroundColor: "#dad7cd",
				}}
			>
				<CardContent>
					<Typography sx={{ mb: 1.5 }} color="text.secondary">
						Total Balance Across Channels: 1000 Satoshis
					</Typography>
				</CardContent>
			</Card>
		</div>
	);
}

export default OurNodeStats;
