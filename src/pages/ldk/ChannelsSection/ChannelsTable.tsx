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
import { writeText } from "@tauri-apps/api/clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNodeContext } from "../../../state/NodeContext";
import { BitcoinUnit, ChannelDetails } from "../../../types";

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
		(property: keyof Data) =>
		(event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={"center"}
						padding={
							headCell.disablePadding
								? "none"
								: "normal"
						}
						sortDirection={
							orderBy === headCell.id ? order : false
						}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={
								orderBy === headCell.id
									? order
									: "asc"
							}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box
									component="span"
									sx={visuallyHidden}
								>
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
	const {
		list_channels,
		is_node_running,
		convert_to_current_unit,
	} = useNodeContext();
	const [rows, setRows] = React.useState<ChannelDetails[]>([]);

	React.useEffect(() => {
		const init = async () => {
			let isNodeRunning = await is_node_running();
			if (!isNodeRunning) return;
			let channels = await list_channels();
			setRows(channels);
		};

		init();
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

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const isSelected = (name: string) =>
		selected.indexOf(name) !== -1;

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
		<Box sx={{ width: "100%" }}>
			<Paper sx={{ width: "100%" }}>
				<EnhancedTableToolbar numSelected={selected.length} />
				<TableContainer>
					<Table
						sx={{ minWidth: 750, overflow: "scroll" }}
						aria-labelledby="tableTitle"
						size={"small"}
					>
						<EnhancedTableHead
							numSelected={selected.length}
							order={order}
							orderBy={orderBy}
							onSelectAllClick={(_event) => {}}
							onRequestSort={handleRequestSort}
							rowCount={rows.length}
						/>
						<TableBody>
							{visibleRows.map((row, index) => {
								const labelId = `enhanced-table-checkbox-${index}`;

								return (
									<TableRow
										hover={false}
										onClick={(_event) => {}}
										role="checkbox"
										aria-checked={false}
										tabIndex={-1}
										key={String(row.channel_id)}
										selected={false}
										sx={{
											cursor: "default",
										}}
									>
										<TableCell align="left">
											{row.channel_id}
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
											{row.is_channel_ready
												? "Yes"
												: "No"}
										</TableCell>
										<TableCell align="left">
											{convert_to_current_unit(
												row.balance_msat,
												BitcoinUnit.MillionthSatoshis
											)}
										</TableCell>
										<TableCell align="left">
											{row.is_usable
												? "Yes"
												: "No"}
										</TableCell>
										<TableCell align="left">
											{row.is_outbound
												? "Yes"
												: "No"}
										</TableCell>
										<TableCell align="left">
											{row.is_public
												? "Yes"
												: "No"}
										</TableCell>
										<TableCell align="left">
											{row.counterparty_node_id}
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
