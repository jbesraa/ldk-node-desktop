import {
	Button,
	Card,
	CardContent,
	Divider,
	Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DialogWindow, TitleCard } from "../../common";
import { createContext, useEffect, useState } from "react";
import { useBitcoinContext } from "../../state/BitcoinContext";
import CreateBitcoinWalletDialog from "./CreateWallet";
import WalletView, { WalletData } from "./WalletView";
import { useNodeContext } from "../../state/NodeContext";
import { CreateWalletInput } from "../../types";
import Stepper from "../../common/carousle";
import CircleIcon from "@mui/icons-material/Circle";

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
		}, 10000);
		return () => clearInterval(timer);
	}, []);
	useEffect(() => {
		const handler = async () => {
			let res = await is_node_running(title);
			setIsNodeRunning(res);
		};
		handler();
	}, []);

	const CardStyle = {
		minWidth: 225,
		boxShadow: "none",
		minHeight: "12vh",
		backgroundColor:
			selected || mouseOver ? "#344e41" : "inherit",
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
					color={
						selected || mouseOver ? "white" : "#344e41"
					}
				>
					{title}
				</Typography>
			</CardContent>
		</Card>
	);
}

interface BitcoinScreenProps {
	selectedWallet: string;
	onSelectWallet: (walletName: string) => void;
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
}

function BitcoinScreen(props: BitcoinScreenProps) {
	const { onSelectWallet, selectedWallet } = props;
	const [wallets, setWallets] = useState<string[]>([]);
	const [refresh, setRefresh] = useState(false);
	const { list_wallets } = useBitcoinContext();
	const [activeWalletsStep, setActiveWalletsStep] = useState(0);

	useEffect(() => {
		const handler = async () => {
			let wallets = await list_wallets();
			setWallets(wallets);
		};
		handler();
	}, [refresh]);

	return (
		<div style={{ padding: "1em" }}>
			<TitleCard
				title="Wallets"
				refreshWallets={() => setRefresh(!refresh)}
				value="Offline"
			/>
			{Math.ceil(wallets.length / 4) > 1 && (
				<Stepper
					steps={Math.ceil(wallets.length / 4)}
					activeStep={activeWalletsStep}
					setActiveStep={setActiveWalletsStep}
				/>
			)}
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
									selected={
										wallet == selectedWallet
									}
									onClickHandler={() =>
										onSelectWallet(wallet)
									}
								/>
							</div>
						);
					})}
			</div>
		</div>
	);
}

export default BitcoinScreen;
