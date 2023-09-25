import OurNodeData from "./OurNodeData";
import OurNodeActions from "./OurNodeActions";

const OurNodeSection = () => {
	return (
		<div
			style={{
				gridGap: "0.8em",
				paddingTop: "2em",
				display: "grid",
				gridTemplateColumns: "1.2fr 1fr",
			}}
		>
			<OurNodeData />
			<OurNodeActions />
		</div>
	);
};

export default OurNodeSection;
