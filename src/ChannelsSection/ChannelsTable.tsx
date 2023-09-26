import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { visuallyHidden } from "@mui/utils";
import { BitcoinUnit, ChannelDetails } from "../types";
import { useNodeContext } from "../NodeContext";
import { writeText } from "@tauri-apps/api/clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface Data {
	channel_id: string;
	channel_value_msat: number;
	confirmations: number;
	is_channel_ready: string;
	balance_msat: number;
	is_usable: string;
	is_outbound: string;
	is_public: string;
	counterparty_node_id: string;
	inbound_capacity_msat: number;
	outbound_capacity_msat: number;
}

type Order = "asc" | "desc";

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: "channel_id",
		numeric: false,
		disablePadding: true,
		label: "Channel ID",
	},
	{
		id: "channel_value_msat",
		numeric: true,
		disablePadding: true,
		label: "Channel Value",
	},
	{
		id: "confirmations",
		numeric: true,
		disablePadding: true,
		label: "Confirmations",
	},
	{
		id: "is_channel_ready",
		numeric: true,
		disablePadding: true,
		label: "Ready",
	},
	{
		id: "balance_msat",
		numeric: true,
		disablePadding: true,
		label: "Balance",
	},
	{
		id: "is_usable",
		numeric: true,
		disablePadding: true,
		label: "Usable",
	},
	{
		id: "is_outbound",
		numeric: true,
		disablePadding: true,
		label: "Outbound",
	},
	{
		id: "is_public",
		numeric: true,
		disablePadding: true,
		label: "Public",
	},
	{
		id: "counterparty_node_id",
		numeric: false,
		disablePadding: true,
		label: "Counterprty Node Id",
	},
	{
		id: "inbound_capacity_msat",
		numeric: true,
		disablePadding: true,
		label: "Inbound Capacity",
	},
	{
		id: "outbound_capacity_msat",
		numeric: true,
		disablePadding: true,
		label: "Outbound Capacity",
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (
		event: React.MouseEvent<unknown>,
		property: keyof Data
	) => void;
	onSelectAllClick: (
		event: React.ChangeEvent<HTMLInputElement>
	) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const {
		onSelectAllClick,
		order,
		orderBy,
		numSelected,
		rowCount,
		onRequestSort,
	} = props;
	const createSortHandler =
		(property: keyof Data) => (event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};

	return (
		<TableHead>
			<TableRow>
				<TableCell padding="checkbox">
					<Checkbox
						color="primary"
						indeterminate={numSelected > 0 && numSelected < rowCount}
						checked={rowCount > 0 && numSelected === rowCount}
						onChange={onSelectAllClick}
						inputProps={{
							"aria-label": "select all desserts",
						}}
					/>
				</TableCell>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={"left"}
						padding={headCell.disablePadding ? "none" : "normal"}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : "asc"}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === "desc"
										? "sorted descending"
										: "sorted ascending"}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface EnhancedTableToolbarProps {
	numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	const { numSelected } = props;

	return (
		<Toolbar
			sx={{
				pl: { sm: 2 },
				pr: { xs: 1, sm: 1 },
				...(numSelected > 0 && {
					bgcolor: (theme) =>
						alpha(
							theme.palette.primary.main,
							theme.palette.action.activatedOpacity
						),
				}),
			}}
		>
			{numSelected > 0 ? (
				<Typography
					sx={{ flex: "1 1 100%" }}
					color="inherit"
					variant="subtitle1"
					component="div"
				>
					{numSelected} selected
				</Typography>
			) : (
				<Typography
					sx={{ flex: "1 1 100%" }}
					variant="h6"
					id="tableTitle"
					component="div"
				>
					Channels
				</Typography>
			)}
			{/**<Tooltip title="Close Channel">
				<IconButton>
					<HighlightOffIcon />
				</IconButton>
			</Tooltip>**/}
		</Toolbar>
	);
}

export default function ChannelsTable() {
	const { list_channels, is_node_running, convert_to_current_unit } =
		useNodeContext();
	const [rows, setRows] = React.useState<ChannelDetails[]>([]);

	React.useEffect(() => {
		const init = async () => {
			let isNodeRunning = await is_node_running();
			if (!isNodeRunning) return;
			let channels = await list_channels();
			setRows(channels);
		};

		const timer = setInterval(async () => {
			init();
		}, 5000);

		return () => {
			clearInterval(timer);
		};
	}, [list_channels]);

	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] =
		React.useState<keyof Data>("channel_id");
	const [selected, setSelected] = React.useState<readonly string[]>(
		[]
	);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const handleRequestSort = (
		_event: React.MouseEvent<unknown>,
		property: keyof Data
	) => {
		const isAsc = orderBy === property && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(property);
	};

	const handleSelectAllClick = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (event.target.checked) {
			const newSelected = rows.map((n) => n.channel_id);
			setSelected(newSelected);
			return;
		}
		setSelected([]);
	};

	const handleClick = (
		_event: React.MouseEvent<unknown>,
		name: string
	) => {
		const selectedIndex = selected.indexOf(name);
		let newSelected: readonly string[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, name);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1)
			);
		}

		setSelected(newSelected);
	};

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const isSelected = (name: string) => selected.indexOf(name) !== -1;

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
		[order, orderBy, page, rowsPerPage, rows]
	);

	return (
		<Box sx={{ width: "100%", paddingTop: 2 }}>
			<Paper sx={{ width: "100%", mb: 2 }}>
				<EnhancedTableToolbar numSelected={selected.length} />
				<TableContainer>
					<Table
						sx={{ minWidth: 750 }}
						aria-labelledby="tableTitle"
						size={"medium"}
					>
						<EnhancedTableHead
							numSelected={selected.length}
							order={order}
							orderBy={orderBy}
							onSelectAllClick={handleSelectAllClick}
							onRequestSort={handleRequestSort}
							rowCount={rows.length}
						/>
						<TableBody>
							{visibleRows.map((row, index) => {
								const isItemSelected = isSelected(
									String(row.channel_id)
								);
								const labelId = `enhanced-table-checkbox-${index}`;

								return (
									<TableRow
										hover
										onClick={(event) =>
											handleClick(event, String(row.channel_id))
										}
										role="checkbox"
										aria-checked={isItemSelected}
										tabIndex={-1}
										key={String(row.channel_id)}
										selected={isItemSelected}
										sx={{
											cursor: "pointer",
										}}
									>
										<TableCell padding="checkbox">
											<Checkbox
												color="primary"
												checked={isItemSelected}
												inputProps={{
													"aria-labelledby": labelId,
												}}
											/>
										</TableCell>
										<TableCell
											component="th"
											id={labelId}
											scope="row"
											padding="none"
										>
											{row.channel_id.slice(0, 5)}..{row.channel_id.slice(-5)}
											<span
												style={{ cursor: "pointer" }}
												onClick={() => writeText(row.channel_id)}
											>
												<ContentCopyIcon />
											</span>
										</TableCell>
										<TableCell align="left">
											{convert_to_current_unit(
												row.channel_value_sats,
												BitcoinUnit.Satoshis
											)}
										</TableCell>
										<TableCell align="left">
											{row.confirmations}
										</TableCell>
										<TableCell align="left">
											{row.is_channel_ready ? "Yes" : "No"}
										</TableCell>
										<TableCell align="left">
											{convert_to_current_unit(
												row.balance_msat,
												BitcoinUnit.MillionthSatoshis
											)}
										</TableCell>
										<TableCell align="left">
											{row.is_usable ? "Yes" : "No"}
										</TableCell>
										<TableCell align="left">
											{row.is_outbound ? "Yes" : "No"}
										</TableCell>
										<TableCell align="left">
											{row.is_public ? "Yes" : "No"}
										</TableCell>
										<TableCell align="left">
											{row.counterparty_node_id.slice(0, 8)}
										</TableCell>
										<TableCell align="left">
											{convert_to_current_unit(
												row.inbound_capacity_msat,
												BitcoinUnit.MillionthSatoshis
											)}
										</TableCell>
										<TableCell align="left">
											{convert_to_current_unit(
												row.outbound_capacity_msat,
												BitcoinUnit.MillionthSatoshis
											)}
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
			</Paper>
		</Box>
	);
}
