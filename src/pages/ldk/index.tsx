import { TitleCard } from "../../common";
import ChannelsSection from "./ChannelsSection";
import OurNodeSection from "./OurNodeSection";
import PaymentsSection from "./PaymentsSection";
import PeersSection from "./PeersSection";

function LDKScreen() {
    return (
        <>
            <TitleCard 
                title={"LDK Node"}
                value={"Offline"}
                />
            <OurNodeSection />
            <PeersSection />
            <ChannelsSection />
            <PaymentsSection />
        </>
    );
}

export default LDKScreen;
