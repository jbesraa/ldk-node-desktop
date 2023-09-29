import { Button, Card, CardContent, Typography } from "@mui/material";

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
                <Button sx={{ justifySelf: "end" }}> Actions </Button>
                </div>
                <Typography variant="h2" color="#344e41">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default TitleCard;
