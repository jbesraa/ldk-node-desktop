import { AppBar, Box, Tab, Tabs, Typography } from "@mui/material";
import { TitleCard } from "../../common";
import ChannelsSection from "./ChannelsSection";
import OurNodeSection from "./OurNodeSection";
import PaymentsSection from "./PaymentsSection";
import PeersSection from "./PeersSection";
import { useEffect, useState } from "react";
import { useNodeContext } from "../../state/NodeContext";

export const TabsBar = ({ value, handleChange }: any) => {
    return (
        <AppBar
            sx={{ marginTop: "1em" }}
            position="static"
            color="default"
        >
            <Tabs
                value={value}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
            >
                <Tab
                    onClick={() => handleChange(0)}
                    label="Peers"
                    value={0}
                />
                <Tab
                    onClick={() => handleChange(1)}
                    label="Channels"
                    value={1}
                />
                <Tab
                    onClick={() => handleChange(2)}
                    label="Payments"
                    value={2}
                />
            </Tabs>
        </AppBar>
    );
};

const TabPanel = (props: any) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
};

function LDKScreen() {
    const [selectedTab, setSelectedTab] = useState(0);
    const { is_node_running } = useNodeContext();
    const [isNodeRunning, setIsNodeRunning] = useState(false);

    // useEffect(() => {
    //     const timer = setInterval(async () => {
    //         let res = await is_node_running();
    //         setIsNodeRunning(res);
    //     }, 1000);
    //     return () => clearInterval(timer);
    // }, []);

    return (
        <>
            <TitleCard title={"LDK Node"} value={isNodeRunning ? "Online": "Offline"} />
            <OurNodeSection />
            <TabsBar
                value={selectedTab}
                handleChange={(v: any) => setSelectedTab(v)}
            />
            <TabPanel value={selectedTab} index={0}>
                <PeersSection />
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
                <ChannelsSection />
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
                <PaymentsSection />
            </TabPanel>
        </>
    );
}

export default LDKScreen;
