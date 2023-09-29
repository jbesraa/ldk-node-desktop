import OurNodeData from "./OurNodeData";
import OurNodeActions from "./OurNodeActions";
import OurNodeStats from "./OurNodeStats";

const OurNodeSection = () => {
    return (
        <div>
                <OurNodeData />
                {/** <OurNodeActions />**/}
            <OurNodeStats />
        </div>
    );
};

export default OurNodeSection;
