import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Select,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import type { AlgorithmState } from "../types";

interface AlgorithmControlsProps {
  state: AlgorithmState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onAlgorithmChange: (algorithm: string) => void;
  onStepChange: (step: number) => void;
  algorithms: { value: string; label: string }[];
}

const AlgorithmControls = ({
  state,
  onStart,
  onPause,
  onReset,
  onSpeedChange,
  onAlgorithmChange,
  onStepChange,
  algorithms,
}: AlgorithmControlsProps) => {
  return (
    <Box bg="white" p={4} shadow="sm" rounded="lg">
      <VStack spacing="4" align="stretch">
        <HStack justify="space-between">
          <Select
            value={state.selectedAlgorithm}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onAlgorithmChange(e.target.value)
            }
            w="200px"
          >
            {algorithms.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </Select>
          <HStack>
            <Button
              colorScheme="blue"
              onClick={state.isRunning ? onPause : onStart}
              disabled={
                state.isRunning
                  ? false
                  : state.currentStep > 0 &&
                    state.currentStep === state.totalSteps
              }
            >
              {state.isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              disabled={state.isRunning}
            >
              Reset
            </Button>
          </HStack>
        </HStack>

        <Box>
          <Text mb={2}>Speed: {state.speed}x</Text>
          <Slider
            min={1}
            max={10}
            step={1}
            value={state.speed}
            onChange={onSpeedChange}
            isDisabled={state.isRunning}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>

        <HStack justify="space-between" align="center">
          <IconButton
            aria-label="Previous step"
            icon={<ChevronLeftIcon />}
            onClick={() => onStepChange(state.currentStep - 1)}
            isDisabled={state.isRunning || state.currentStep === 0}
          />
          <Text>
            Step: {state.currentStep} / {state.totalSteps}
          </Text>
          <IconButton
            aria-label="Next step"
            icon={<ChevronRightIcon />}
            onClick={() => onStepChange(state.currentStep + 1)}
            isDisabled={
              state.isRunning || state.currentStep === state.totalSteps
            }
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default AlgorithmControls;
