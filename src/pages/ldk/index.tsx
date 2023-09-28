import ChannelsSection from "./ChannelsSection";
import OurNodeSection from "./OurNodeSection";
import PaymentsSection from "./PaymentsSection";
import PeersSection from "./PeersSection";

function LDKScreen() {
    return (
        <>
            <OurNodeSection />
            <PeersSection />
            <ChannelsSection />
            <PaymentsSection />
        </>
    );
}

export default LDKScreen;
