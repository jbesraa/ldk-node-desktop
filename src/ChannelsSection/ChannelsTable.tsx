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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { ChannelDetails } from "../types";
import { useNodeContext } from "../NodeContext";
import LinkIcon from "@mui/icons-material/Link";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

interface Data {
	channel_id: string;
	channel_value_msat: number;
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
		disablePadding: false,
		label: "Channel Value (msat)",
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
						align={headCell.numeric ? "right" : "left"}
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
			<Tooltip title="Close Channel">
				<IconButton>
					<HighlightOffIcon />
				</IconButton>
			</Tooltip>
		</Toolbar>
	);
}

export default function ChannelsTable() {
	const { list_channels, is_node_running } = useNodeContext();
	const [rows, setRows] = React.useState<ChannelDetails[]>([]);

	React.useEffect(() => {
		const init = async () => {
			let isNodeRunning = await is_node_running();
			console.log(isNodeRunning);
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
	console.log(visibleRows);

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
											{row.channel_id}
										</TableCell>
										<TableCell align="right">
											{row.channel_value_sats}
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

// <Card sx={{ minWidth: 275 }}>
// 	<CardContent>
// 		<Typography
// 			sx={{ fontSize: 14 }}
// 			color="text.secondary"
// 			gutterBottom
// 		>
// 			Node Info
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			Channel Value: {channel_value_sats} Satoshis
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			Couterparty Node Id: {counterparty_node_id.slice(0, 23)}..
// 			{counterparty_node_id.slice(
// 				counterparty_node_id.length - 5,
// 				counterparty_node_id.length - 1
// 			)}
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			Channel Id: {channel_id}
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			Balance: {balance_msat} msat
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			Inbound Capacity: {inbound_capacity_msat} msat
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			Outbound Capacity: {outbound_capacity_msat} msat
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			{is_channel_ready ? "Channel Ready" : "Channel Not Ready"}
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			{is_usable ? "Usable" : "Not Usable"}
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			{is_public ? "Public" : "Not Public"}
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			{is_outbound ? "Outbound" : "Inbound"}
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			{confirmations} / {confirmations_required} Confirmations
// 		</Typography>
// 		<Typography variant="h5" component="div">
// 			CLTV Expiry Delta: {cltv_expiry_delta}
// 		</Typography>
// 	</CardContent>
// 	<CardActions>
// 		<Button disabled={true} size="small">
// 			More Info
// 		</Button>
// 	</CardActions>
// </Card>
// );
// }
