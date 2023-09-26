const AddressView = (address: string) => {
	return (
				<Typography variant="subtitle1" color="text.secondary" >
					Node ID: {nodeId.slice(0, 10) + "..." + nodeId.slice(-10)}{" "}
					<span style={{ cursor: "pointer" }}onClick={() => writeText(nodeId)}>
						<ContentCopyIcon />
					</span>
				</Typography>
	)
}
