import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import RefreshIcon from "@mui/icons-material/Refresh";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
	Button,
	Dialog,
	DialogTitle,
	TableSortLabel,
} from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useNodeContext } from "../../../state/NodeContext";

interface Data {
	time: string;
	kind: string;
	message: string;
}

const buttonStyle = {
	color: "#344e41",
	fontWeight: "600",
	backgroundColor: "#a3b18a",
};

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: "time",
		numeric: false,
		disablePadding: false,
		label: "Time",
	},
	{
		id: "kind",
		numeric: false,
		disablePadding: true,
		label: "Kind",
	},
	{
		id: "message",
		numeric: false,
		disablePadding: false,
		label: "Message",
	},
];

function EnhancedTableHead() {
	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? "right" : "left"}
						padding={
							headCell.disablePadding
								? "none"
								: "normal"
						}
						sortDirection={false}
					>
						<TableSortLabel
							active={false}
							direction={"asc"}
							onClick={() => {}}
						>
							{headCell.label}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface LogType {
	time: string;
	message: string;
	kind: string;
}

export interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
}

function LogsTable(i: any) {
	const { rows } = i;
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0
			? Math.max(0, (1 + page) * rowsPerPage - rows.length)
			: 0;

	const visibleRows = React.useMemo(
		() =>
			rows.slice(
				page * rowsPerPage,
				page * rowsPerPage + rowsPerPage
			),
		[page, rowsPerPage, rows]
	);

	return (
		<>
			<TableContainer>
				<Table
					sx={{ minWidth: 750 }}
					aria-labelledby="tableTitle"
					size={"medium"}
				>
					<EnhancedTableHead />
					<TableBody>
						{visibleRows.map((row: any) => {
							return (
								<TableRow
									hover
									onClick={() => {}}
									tabIndex={-1}
									key={String(row)}
									selected={false}
									sx={{ cursor: "pointer" }}
								>
									<TableCell
										component="th"
										scope="row"
										padding="none"
									>
										{row.time}
									</TableCell>
									<TableCell align="left">
										{row.kind}
									</TableCell>
									<TableCell align="left">
										{row.message}
									</TableCell>
								</TableRow>
							);
						})}
						{emptyRows > 0 && (
							<TableRow
								style={{
									height: 53 * emptyRows,
								}}
							>
								<TableCell colSpan={6} />
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[5, 10, 25]}
				component="div"
				count={rows.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</>
	);
}

enum LogsTabsKinds {
	Trace = 0,
	Error = 1,
	Info = 2,
}

function LogsDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open } = props;
	const { is_node_running, get_logs } = useNodeContext();
	const [rows, setRows] = React.useState<LogType[]>([]);
	const [infoLogs, setInfoLogs] = React.useState<LogType[]>([]);
	const [errorLogs, setErrorLogs] = React.useState<LogType[]>([]);
	const [traceLogs, setTraceLogs] = React.useState<LogType[]>([]);
	const [selectedTab, setSelectedTab] = React.useState(
		LogsTabsKinds.Info
	);

	const handleTabChange = (
		_event: React.SyntheticEvent,
		newValue: number
	) => {
		if (newValue === LogsTabsKinds.Trace) setRows(traceLogs);
		else if (newValue === LogsTabsKinds.Error) setRows(errorLogs);
		else if (newValue === LogsTabsKinds.Info) setRows(infoLogs);
		setSelectedTab(newValue);
	};

	const handler = async () => {
		let logs: string[] = await get_logs();
		let traceLogs: LogType[] = [];
		let errorLogs: LogType[] = [];
		let infoLogs: LogType[] = [];
		for (let i = logs.length - 1; i > logs.length - 100; i--) {
			// split string after second space
			const log = logs[i];
			const index = log.indexOf(" ", log.indexOf(" ") + 1);
			const time = log.substr(0, index);
			const message = log.substr(index + 1);
			const kind = message.split(" ")[0];
			const data = {
				time: time,
				message: message,
				kind: kind,
			};
			if (kind === "TRACE") traceLogs.push(data);
			else if (kind === "ERROR") errorLogs.push(data);
			else if (kind === "INFO") infoLogs.push(data);
		}
		setTraceLogs(traceLogs);
		setErrorLogs(errorLogs);
		setInfoLogs(infoLogs);
		handleTabChange({} as React.SyntheticEvent, 0);
	};

	React.useEffect(() => {
		const init = async () => {
			let isNodeRunning = await is_node_running();
			if (!isNodeRunning) return;
			await handler();
		};
		init();
		return () => {
			setRows([]);
			setErrorLogs([]);
			setInfoLogs([]);
			setTraceLogs([]);
		}
	}, [get_logs]);

	const handleClose = () => {
		onClose(selectedValue);
	};

	return (
		<Dialog
			fullWidth={true}
			maxWidth="lg"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>
				Logs
			</DialogTitle>
			<Box sx={{ width: "100%", paddingTop: 2 }}>
				<Paper sx={{ width: "100%", mb: 2 }}>
			<div style={{ textAlign: "end", paddingRight: "1em" }}>
				<Button
					style={buttonStyle}
					onClick={handler}
					variant="contained"
					startIcon={<RefreshIcon />}
				>
					Refresh
				</Button>
			</div>
					<LogsTabs
						handleTabChange={handleTabChange}
						value={selectedTab}
					/>
					<LogsTable rows={rows} />
				</Paper>
			</Box>
		</Dialog>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}

interface LogsTabsProps {
	handleTabChange: (
		event: React.SyntheticEvent,
		newValue: number
	) => void;
	value: number;
}
function LogsTabs(i: LogsTabsProps) {
	const { handleTabChange, value } = i;

	return (
		<Box sx={{ width: "100%" }}>
			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<Tabs
					value={value}
					onChange={handleTabChange}
					aria-label="basic tabs example"
				>
					<Tab label="Trace" {...a11yProps(0)} />
					<Tab label="Error" {...a11yProps(1)} />
					<Tab label="Info" {...a11yProps(2)} />
				</Tabs>
			</Box>
		</Box>
	);
}

export default LogsDialog;
