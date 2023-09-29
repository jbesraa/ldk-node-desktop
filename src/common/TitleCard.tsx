import { Card, CardContent, Typography } from "@mui/material";
import { DropdownButton } from ".";

function TitleCard({
    title,
    value,
}: {
    title: string;
    value: string | number;
}) {
    const CardStyle = {
        minWidth: 265,
        minHeight: "20vh",
        color: "#344e41",
        backgroundColor: "#dad7cd",
        marginBottom: "1em"
    };

    return (
        <Card sx={CardStyle}>
            <CardContent>
                <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr" }}>
                <Typography variant="overline" color="gray">
                    {title}
                </Typography>
                <DropdownButton 
                    options={[
                    {name: "0", val: "Connect to Lightning Peer"},
                    {name: "0", val: "Open Lightning Channel"},
                    {name: "0", val: "Close Lightning Channel"},
                    {name: "0", val: "Show Lightning Logs"},
                    {name: "0", val: "Create Invoice"},
                    {name: "0", val: "Pay Invoice"},
                    ]}
                    label="Actions"
                    selectedValue=""
                    onChange={(e) => { console.log(e) }}
                />
                {/**<Button sx={{ justifySelf: "end" }}> Actions </Button>**/}
                </div>
                <Typography variant="h2" color="#344e41">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default TitleCard;
