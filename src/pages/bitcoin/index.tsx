import { Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useNodeContext } from "../../state/NodeContext";
import { DropdownButton, TitleCard } from "../../common";

// function TitleCard({
//     title,
//     value,
// }: {
//     title: string;
//     value: string | number;
// }) {
//     const CardStyle = {
//         minWidth: 265,
//         minHeight: "20vh",
//         color: "#344e41",
//         backgroundColor: "#dad7cd",
//         marginBottom: "1em",
//     };

//     return (
//         <Card sx={CardStyle}>
//             <CardContent>
//                 <div
//                     style={{
//                         display: "grid",
//                         gridTemplateColumns: "1fr 1fr",
//                     }}
//                 >
//                     <Typography variant="overline" color="gray">
//                         {title}
//                     </Typography>
//                     <DropdownButton
//                         options={[
//                             {
//                                 name: "0",
//                                 val: "Connect to Lightning Peer",
//                             },
//                             {
//                                 name: "0",
//                                 val: "Open Lightning Channel",
//                             },
//                             {
//                                 name: "0",
//                                 val: "Close Lightning Channel",
//                             },
//                             { name: "0", val: "Show Lightning Logs" },
//                             { name: "0", val: "Create Invoice" },
//                             { name: "0", val: "Pay Invoice" },
//                         ]}
//                         label="Actions"
//                         selectedValue=""
//                         onChange={(e) => {
//                             console.log(e);
//                         }}
//                     />
//                     {/**<Button sx={{ justifySelf: "end" }}> Actions </Button>**/}
//                 </div>
//                 <Typography variant="h2" color="#344e41">
//                     {value}
//                 </Typography>
//                     <TextField label="Enter Esplora URL" />
//                     <Button style={{ height: "56px", marginLeft: "1em" }} variant="outlined">Set</Button>
//             </CardContent>
//         </Card>
//     );
// }

function BitcoinScreenCard({
    title,
    value,
}: {
    title: string;
    value: string | number;
}) {
    const CardStyle = {
        minWidth: 265,
        minHeight: "20vh",
        backgroundColor: "#344e41",
    };

    return (
        <Card sx={CardStyle}>
            <CardContent>
                <Typography variant="overline" color="gray">
                    {title}
                </Typography>
                <Typography variant="h2" color="white">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

function BitcoinScreen() {
    const { bitcoinUnit } = useNodeContext();

    return (
        <>
            <TitleCard title="Bitcoin" value="Offline" />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gridGap: "1em",
                }}
            >
                {/** <BitcoinScreenCard title={"Balance"} value={`21 ${bitcoinUnit}`} /> **/}
                <BitcoinScreenCard title={"Sync"} value={"0%"} />
            </div>
        </>
    );
}

export default BitcoinScreen;
