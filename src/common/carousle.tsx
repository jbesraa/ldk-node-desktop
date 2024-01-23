import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

export default function Stepper({
	steps,
	activeStep,
	setActiveStep,
}: {
	steps: number;
	activeStep: number;
	setActiveStep: any;
}) {
	const theme = useTheme();
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

			console.log(steps);
			console.log("active", activeStep);
	return (
		<MobileStepper
			variant="dots"
			steps={steps}
			position="static"
			activeStep={activeStep}
			sx={{backgroundColor: "inherit"}}
			nextButton={
				<Button
					size="large"
					onClick={handleNext}
					color="success"
					disabled={activeStep === steps - 1 || steps === 1}
				>
					Next
					{theme.direction === "rtl" ? (
						<KeyboardArrowLeft />
					) : (
						<KeyboardArrowRight />
					)}
				</Button>
			}
			backButton={
				<Button
					size="large"
					onClick={handleBack}
					color="success"
					disabled={steps === 0 || activeStep === 0}
				>
					{theme.direction === "rtl" ? (
						<KeyboardArrowRight />
					) : (
						<KeyboardArrowLeft />
					)}
					Back
				</Button>
			}
		/>
	);
}
