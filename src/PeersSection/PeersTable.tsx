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
import { visuallyHidden } from "@mui/utils";
import { PeerDetails, ConnectToPeerInput } from "../types";
import { useNodeContext } from "../NodeContext";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { writeText } from "@tauri-apps/api/clipboard";

interface Data {
	node_id: string;
	is_connected: string;
	is_persisted: string;
	address: string;
	shared_channels: number;
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
		id: "node_id",
		numeric: false,
		disablePadding: true,
		label: "Node Id",
	},
	{
		id: "is_connected",
		numeric: false,
		disablePadding: false,
		label: "Connected",
	},
	{
		id: "is_persisted",
		numeric: false,
		disablePadding: false,
		label: "Persisted",
	},
	{
		id: "address",
		numeric: false,
		disablePadding: false,
		label: "Address",
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
	disconnectSelectedNodes: () => void;
	connectToSelectedNodes: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	const {
		numSelected,
		connectToSelectedNodes,
		disconnectSelectedNodes,
	} = props;

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
					Peers
				</Typography>
			)}
			<Tooltip title="Connect">
				<IconButton onClick={connectToSelectedNodes}>
					<LinkIcon />
				</IconButton>
			</Tooltip>
			<Tooltip title="Disconnect">
				<IconButton onClick={disconnectSelectedNodes}>
					<LinkOffIcon />
				</IconButton>
			</Tooltip>
		</Toolbar>
	);
}

interface TablePeerDetails {
	node_id: string;
	is_connected: string;
	is_persisted: string;
	address: string;
	shared_channels: number;
}

export default function PeersTable() {
	const {
		list_peers,
		is_node_running,
		connect_to_peer,
		disconnect_peer,
	} = useNodeContext();
	const [rows, setRows] = React.useState<TablePeerDetails[]>([]);

	React.useEffect(() => {
		const init = async () => {
			let isNodeRunning = await is_node_running();
			if (!isNodeRunning) return;
			let peers = await list_peers();
			const new_rows: TablePeerDetails[] = peers.map(
				(row: PeerDetails) => {
					return {
						node_id: row.node_id,
						is_connected: row.is_connected ? "Yes" : "No",
						is_persisted: row.is_persisted ? "Yes" : "No",
						address: row.address,
						shared_channels: 0,
					};
				}
			);
			setRows(new_rows);
		};

		const timer = setInterval(async () => {
			init();
		}, 5000);

		return () => {
			clearInterval(timer);
		};
	}, [list_peers]);

	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] = React.useState<keyof Data>("node_id");
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
			const newSelected = rows.map((n) => n.node_id);
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

	const connectToSelectedNodes = async () => {
		const nodes: ConnectToPeerInput[] = [];
		const selected_nodes = selected;
		for (let i = 0; i < selected_nodes.length; i++) {
			const nodeId = selected_nodes[i];
			let net_address = rows.find(
				(r) => (r.node_id = nodeId)
			)?.address;
			if (!net_address) continue;
			else nodes.push({ node_id: nodeId, net_address: net_address });
		}
		await Promise.all(
			nodes.map((n: ConnectToPeerInput) => connect_to_peer(n))
		);
	};

	const disconnectSelectedNodes = async () => {
		await Promise.all(
			selected.map((n: string) => disconnect_peer(n))
		);
	};

	return (
		<Box sx={{ width: "100%", paddingTop: 2 }}>
			<Paper sx={{ width: "100%", mb: 2 }}>
				<EnhancedTableToolbar
					disconnectSelectedNodes={disconnectSelectedNodes}
					connectToSelectedNodes={connectToSelectedNodes}
					numSelected={selected.length}
				/>
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
									String(row.node_id)
								);
								const labelId = `enhanced-table-checkbox-${index}`;

								return (
									<TableRow
										hover
										onClick={(event) =>
											handleClick(event, String(row.node_id))
										}
										role="checkbox"
										aria-checked={isItemSelected}
										tabIndex={-1}
										key={String(row.node_id)}
										selected={isItemSelected}
										sx={{ cursor: "pointer" }}
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
											<Typography
												variant="subtitle1"
												color="text.secondary"
											>
												{row.node_id.slice(0, 10) +
													"..." +
													row.node_id.slice(-10)}{" "}
												<span
													style={{ cursor: "pointer" }}
													onClick={() => writeText(row.node_id)}
												>
													<ContentCopyIcon />
												</span>
											</Typography>
										</TableCell>
										<TableCell align="left">
											{row.is_connected}
										</TableCell>
										<TableCell align="left">
											{row.is_persisted}
										</TableCell>
										<TableCell align="left">{row.address}</TableCell>
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
