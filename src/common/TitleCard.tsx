import { Card, CardContent, Typography } from "@mui/material";
import { DialogWindow, DropdownButton } from ".";
import MenuButton from "./MenuButton";
import CreateBitcoinWalletDialog from "../pages/bitcoin/CreateWallet";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
function TitleCard({
    title,
    value,
    refreshWallets,
}: {
    title: string;
    value: string | number;
    refreshWallets?: () => void;
}) {
    const CardStyle = {
        color: "#344e41",
        backgroundColor: "inherit",
        borderBottom: "1px dashed #52796f",
        boxShadow: "none",
        maxHeight: "8vh",
    };

    return (
        <Card sx={CardStyle}>
            <CardContent>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                    }}
                >
                    <Typography variant="h4" color="#344e41" style={{ alignSelf:"center" }}>
                        {title}
                    </Typography>
                    <div style={{ justifySelf: "end", alignSelf:"center"}}>
                        <DialogWindow
                            buttonTitle="New"
                            ButtonIcon={<AddCircleOutlineIcon color="success" fontSize="large"/>}
                            onCloseHandler={() => refreshWallets && refreshWallets()}
                            DialogView={CreateBitcoinWalletDialog}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default TitleCard;
