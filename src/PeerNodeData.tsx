import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { PeerDetails } from "./types";

export default function PeerNodeData(i: PeerDetails) {
	const { address, node_id, is_connected, is_persisted } = i
	const sharedChannelsCount = 0

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Node Info
        </Typography>
        <Typography variant="h5" component="div">
				{is_connected ? "Peer Online" : "Peer Offline"}
        </Typography>
        <Typography variant="h5" component="div">
				{is_persisted ? "Persisted" : "Not Persisted"}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Node ID: {node_id.slice(0, 23)}..{node_id.slice(node_id.length - 5, node_id.length - 1)}
        </Typography>
        <Typography variant="body2">
          Address: {address}
        </Typography>
        <Typography variant="body2">
          Number of shared channels: {sharedChannelsCount}
        </Typography>
      </CardContent>
      <CardActions>
        <Button disabled={true} size="small">More Info</Button>
      </CardActions>
    </Card>
  );
}

