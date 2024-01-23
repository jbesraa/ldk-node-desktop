import { Divider } from "@mui/material";
import { useState } from "react";
import { BitcoinScreen } from "..";
import WalletView from "../bitcoin/WalletView";

function HomeScreen() {
	const [selectedWallet, setSelectedWallet] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	return (
		<>
			<BitcoinScreen
				selectedWallet={selectedWallet}
				onSelectWallet={(s) => setSelectedWallet(s)}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
			/>
			<Divider />
			<WalletView name={selectedWallet} isLoading={isLoading} setIsLoading={setIsLoading}/>
		</>
	);
}

export default HomeScreen;
