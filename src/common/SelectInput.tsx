import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@mui/material";

const SelectComponent = ({
    title,
    items,
    selected,
    handleChange,
    disabled,
}: {
    disabled?: boolean;
    title: string;
    items: { value: string; title: string }[];
    selected: string;
    handleChange?: (event: any) => void;
}) => {
    return (
        <FormControl sx={{ m: 1, width: "100%" }} size="medium">
            <InputLabel>{title}</InputLabel>
            <Select
                value={selected}
                disabled={Boolean(disabled)}
                label={title}
                style={{ width: "100%" }}
                onChange={handleChange}
            >
                {items.map((item) => {
                    return (
                        <MenuItem value={item.value}>
                            {item.title}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
};

export default SelectComponent;
