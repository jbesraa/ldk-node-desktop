import * as React from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import PersonAdd from "@mui/icons-material/PersonAdd";
import { AddLink, BoltRounded } from "@mui/icons-material";
import { OpenChannelDialog, ConnectToPeerDialog } from "../actions";
import { DialogWindow } from ".";
import ReceiveDialog from "../pages/home/ReceiveDialog";
import StopNodeDialog from "../pages/home/StopNodeDialog";

interface MenuButtonProps {
	walletName: string;
	isLoading: boolean;
}

export default function MenuButton(props: MenuButtonProps) {
	const { walletName } = props;
	const [anchorEl, setAnchorEl] =
		React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	return (
		<React.Fragment>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					textAlign: "center",
				}}
			>
				<IconButton
					disabled={props.isLoading}
					onClick={handleClick}
					size="large"
					title="Actions"
					sx={{ ml: 2 }}
					aria-controls={open ? "account-menu" : undefined}
					aria-haspopup="true"
					aria-expanded={open ? "true" : undefined}
				>
					<BoltRounded
						color="success"
						sx={{
							width: 62,
							height: 62,
						}}
					/>
				</IconButton>
			</Box>
			<Menu
				anchorEl={anchorEl}
				id="account-menu"
				open={open}
				onClose={handleClose}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: "visible",
						filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
						mt: 1.5,
						"& .MuiAvatar-root": {
							width: 32,
							height: 32,
							ml: -0.5,
							mr: 1,
						},
						"&:before": {
							content: '""',
							display: "block",
							position: "absolute",
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: "background.paper",
							transform:
								"translateY(-50%) rotate(45deg)",
							zIndex: 0,
						},
					},
				}}
				transformOrigin={{
					horizontal: "right",
					vertical: "top",
				}}
				anchorOrigin={{
					horizontal: "right",
					vertical: "bottom",
				}}
			>
				<MenuItem>
					<PersonAdd />
					<span
						style={{
							paddingLeft: "1em",
						}}
					>
						<DialogWindow
							extraProps={{ walletName }}
							buttonTitle="Connect To Peer"
							DialogView={ConnectToPeerDialog}
						/>
					</span>
				</MenuItem>
				<MenuItem>
					<AddLink />
					<span
						style={{
							paddingLeft: "1em",
						}}
					>
						<DialogWindow
							extraProps={{ walletName }}
							buttonTitle="Open Channel"
							DialogView={OpenChannelDialog}
						/>
					</span>
				</MenuItem>
				<MenuItem>
					<AddLink />
					<span
						style={{
							paddingLeft: "1em",
						}}
					>
						<DialogWindow
							extraProps={{ walletName }}
							buttonTitle="Receive Payment"
							DialogView={ReceiveDialog}
						/>
					</span>
				</MenuItem>
				<MenuItem>
					<AddLink />
					<span
						style={{
							paddingLeft: "1em",
						}}
					>
						<DialogWindow
							extraProps={{ walletName }}
							buttonTitle="Stop Node"
							DialogView={StopNodeDialog}
						/>
					</span>
				</MenuItem>
			</Menu>
		</React.Fragment>
	);
}

// <MenuItem>
// 	<PersonRemove />
// 	<span
// 		style={{
// 			paddingLeft: "1em",
// 		}}
// 	>
// 		Disconnect Peer
// 	</span>
// </MenuItem>
// <Divider />
// <MenuItem>
// 	<LinkOff />
// 	<span
// 		style={{
// 			paddingLeft: "1em",
// 		}}
// 	>
// 		<DialogWindow
// 			buttonTitle="Close Channel"
// 			DialogView={CloseChannelDialog}
// 		/>
// 	</span>
// </MenuItem>
// <Divider />
// <MenuItem>
// 	<AddBox />
// 	<span
// 		style={{
// 			paddingLeft: "1em",
// 		}}
// 	>
// 		<DialogWindow
// 			buttonTitle="Create Invoice"
// 			DialogView={CreateInvoiceDialog}
// 		/>
// 	</span>
// </MenuItem>
// <MenuItem>
// 	<Payment />
// 	<span
// 		style={{
// 			paddingLeft: "1em",
// 		}}
// 	>
// 		<DialogWindow
// 			buttonTitle="Pay Invoice"
// 			DialogView={PayInvoiceDialog}
// 		/>
// 	</span>
// </MenuItem>
