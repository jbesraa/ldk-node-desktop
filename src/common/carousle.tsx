import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

export default function Stepper({
	activeStep,
	setActiveStep,
	dataLength,
	shownCount,
}: {
	activeStep: number;
	setActiveStep: any;
	dataLength: number;
	shownCount: number;
}) {
	const steps = Math.floor(dataLength / shownCount);
	const handleNext = () => {
		setActiveStep((prevActiveStep: number) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
	};

	if (!steps) {
		return null;
	}

	return (
		<MobileStepper
			variant="dots"
			steps={steps + 1}
			position="static"
			activeStep={activeStep}
			sx={{ backgroundColor: "inherit" }}
			nextButton={
				<Button
					size="large"
					onClick={handleNext}
					color="success"
					disabled={activeStep === steps || !steps}
				>
					Next
					<KeyboardArrowRight />
				</Button>
			}
			backButton={
				<Button
					size="large"
					onClick={handleBack}
					color="success"
					disabled={!steps || activeStep === 0}
				>
					<KeyboardArrowLeft />
					Back
				</Button>
			}
		/>
	);
}
