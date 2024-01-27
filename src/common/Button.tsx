import { Button } from "@mui/material";

const buttonStyle = {
    color: "#344e41",
    fontSize: "1em",
    width: "100%",
    fontWeight: "600",
    backgroundColor: "#a3b18a",
};

interface GlobalButtonProps {
    onClick: () => void;
    title: string;
    disabled?: boolean;
    extraProps?: any;
    style?: any;
}
const GlobalButton = (props: GlobalButtonProps) => {
    const { onClick, title, disabled, style } = props;
    return (
        <Button
            style={style ? style : buttonStyle}
            variant="contained"
            onClick={onClick}
            disabled={disabled}
        >
        {title}
        </Button>
    );
};

export default GlobalButton;
