import OurNodeData from "./OurNodeData";
import OurNodeActions from "./OurNodeActions";
import OurNodeStats from "./OurNodeStats";

const OurNodeSection = () => {
	return (
		<div>
			<div
				style={{
					gridGap: "0.8em",
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
				}}
			>
				<OurNodeData />
				<OurNodeActions />
			</div>
			<OurNodeStats />
		</div>
	);
};

export default OurNodeSection;
