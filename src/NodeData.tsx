import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface NodeInfoProps {
	nodeId: string;
	isNodeRunning: boolean;
	isWalletSynced: boolean;
	listeningAddress: string;
	onChainBalance: number;
}

export default function BasicCard(i: NodeInfoProps) {
	const nodeId = i.nodeId;
	const isNodeRunning = i.isNodeRunning;
	const isWalletSynced = i.isWalletSynced;
	const listeningAddress = i.listeningAddress;
	const onChainBalance = i.onChainBalance;

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Node Info
        </Typography>
        <Typography variant="h5" component="div">
				{isNodeRunning ? "Running" : "Not Running"}
        </Typography>
        <Typography variant="h5" component="div">
				{isWalletSynced ? "Wallet Synced" : "Wallet Not Synced"}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Node ID: {nodeId}
        </Typography>
        <Typography variant="body2">
          Listening Address: {listeningAddress}
        </Typography>
        <Typography variant="body2">
          On chain balance: {onChainBalance} Satoshis
        </Typography>
      </CardContent>
      <CardActions>
        <Button disabled={true} size="small">More Info</Button>
      </CardActions>
    </Card>
  );
}

