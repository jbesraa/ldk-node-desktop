import { FormControl, Input, InputLabel, MenuItem, Select, useTheme } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

//@ts-ignore
function getStyles(name, personName, theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const MultipleSelect = ({ label, options, selectedValue, onChange }: { label: string, options: { name: string, val: string }[], selectedValue: string, onChange: (e: any) => void }) => {
    const theme = useTheme();

    return (
        <FormControl sx={{ width: 100, justifySelf: "end" }}>
            <InputLabel variant="filled" id="demo-mutiple-chip-label">
                {label}
            </InputLabel>
            <Select
                value={selectedValue}
                variant="filled"
                onChange={onChange}
                input={<Input id="select-multiple-chip" />}
                MenuProps={MenuProps}
            >
                {options.map(({ name, val } : any) => (
                    <MenuItem
                        key={val}
                        value={val}
                        style={getStyles(name, selectedValue, theme)}
                    >
                        {val}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default MultipleSelect;

