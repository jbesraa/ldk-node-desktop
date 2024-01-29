import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
	Card,
	CardContent,
	Divider,
	Typography,
} from "@mui/material";
import { DialogWindow } from "../../common";
import { useEffect, useState } from "react";
import { useBitcoinContext } from "../../state/BitcoinContext";
import CreateBitcoinWalletDialog from "./CreateWalletDialog";
import { useNodeContext } from "../../state/NodeContext";
import Stepper from "../../common/carousle";
import CircleIcon from "@mui/icons-material/Circle";
import WalletView from "./WalletView";

function BitcoinScreenCard({
	title,
	onClickHandler,
	selected,
}: {
	title: string;
	onClickHandler: any;
	selected: boolean;
}) {
	const [isNodeRunning, setIsNodeRunning] = useState(false);
	const { is_node_running } = useNodeContext();
	const [mouseOver, setMouseOver] = useState(false);

	useEffect(() => {
		const timer = setInterval(async () => {
			let res = await is_node_running(title);
			setIsNodeRunning(res);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const handler = async () => {
			let res = await is_node_running(title);
			setIsNodeRunning(res);
		}
		handler()
	}, []);

	const CardStyle = {
		minWidth: 225,
		boxShadow: "none",
		minHeight: "12vh",
		backgroundColor: selected || mouseOver ? "#344e41" : "inherit",
		cursor: "pointer",
	};

	return (
		<Card
			onClick={() => {
				onClickHandler();
				setTimeout(() => {}, 3000);
			}}
			sx={CardStyle}
			onMouseOver={() => setMouseOver(true)}
			onMouseLeave={() => setMouseOver(false)}
		>
			<CardContent>
				{isNodeRunning ? (
					<CircleIcon color="success" />
				) : (
					<CircleIcon color="error" />
				)}
				<Typography
					variant="h2"
					style={{
						textAlign: "center",
						paddingTop: "0.5em",
					}}
					color={selected || mouseOver ? "white" : "#344e41"}
				>
					{title}
				</Typography>
			</CardContent>
		</Card>
	);
}

function BitcoinScreen() {
	const [selectedWallet, setSelectedWallet] = useState("");
	const { list_wallets } = useBitcoinContext();
	const [activeWalletsStep, setActiveWalletsStep] = useState(0);
	const wallets = list_wallets(false);
	const TitleCardStyle = {
		color: "#344e41",
		backgroundColor: "inherit",
		borderBottom: "1px dashed #52796f",
		boxShadow: "none",
		maxHeight: "8vh",
	};

	const PageTitle = () => {
		return (
			<Card sx={TitleCardStyle}>
				<CardContent>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
						}}
					>
						<Typography
							variant="h4"
							color="#344e41"
							style={{ alignSelf: "center" }}
						>
							Wallets
						</Typography>
						<div
							style={{
								justifySelf: "end",
								alignSelf: "center",
							}}
						>
							<DialogWindow
								buttonTitle="New"
								ButtonIcon={
									<AddCircleOutlineIcon
										color="success"
										fontSize="large"
									/>
								}
								onCloseHandler={() => {}}
								DialogView={CreateBitcoinWalletDialog}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

	const WalletsSection = () => {
		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr 1fr",
					gridGap: "1em",
				}}
			>
				{wallets
					?.slice(
						activeWalletsStep * 4,
						wallets.length < activeWalletsStep * 4 + 4
							? wallets.length
							: activeWalletsStep * 4 + 4
					)
					.map((wallet) => {
						return (
							<div
								key={wallet}
								style={{
									border: "1px solid #52796f",
									borderRadius: "15px",
								}}
							>
								<BitcoinScreenCard
									title={wallet}
									selected={wallet == selectedWallet}
									onClickHandler={() => setSelectedWallet(wallet)}
								/>
							</div>
						);
					})}
			</div>
		);
	};

	return (
		<>
			<div style={{ padding: "1em" }}>
				<PageTitle />
					<Stepper
						activeStep={activeWalletsStep}
						setActiveStep={setActiveWalletsStep}
						dataLength={wallets.length}
						shownCount={4}

					/>
				<WalletsSection />
			</div>
			<Divider />
			<WalletView name={selectedWallet} />
		</>
	);
}

export default BitcoinScreen;
