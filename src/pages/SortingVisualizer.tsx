import { useState, useCallback, useRef, useEffect } from "react";
import { Box, HStack, VStack, useToken, Text, Tooltip } from "@chakra-ui/react";
import type { SortingAlgorithm } from "../types";
import type { Step } from "../algorithms/sorting";
import AlgorithmControls from "../components/AlgorithmControls";
import {
  bubbleSort,
  quickSort,
  mergeSort,
  heapSort,
} from "../algorithms/sorting";

const ARRAY_SIZE = 50;
const MIN_VALUE = 5;
const MAX_VALUE = 300;
const BAR_WIDTH = 15;
const ANIMATION_SPEED_MAP = {
  1: 1000, // 1x speed (slowest)
  2: 800,
  3: 600,
  4: 400,
  5: 200,
  6: 100,
  7: 150,
  8: 100,
  9: 50,
  10: 10, // 10x speed (fastest)
};

const generateRandomArray = () => {
  return Array.from(
    { length: ARRAY_SIZE },
    () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

const SortingVisualizer = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray());
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<SortingAlgorithm>("bubble");
  const [currentStepInfo, setCurrentStepInfo] = useState<string>("");
  const [blue500, green500, red500] = useToken("colors", [
    "blue.500",
    "green.500",
    "red.500",
  ]);

  const animationFrameId = useRef<number>();
  const stepsRef = useRef<Step[]>([]);

  const resetArray = useCallback(() => {
    if (animationFrameId.current) {
      clearTimeout(animationFrameId.current);
    }
    setArray(generateRandomArray());
    setIsRunning(false);
    setCurrentStep(0);
    setTotalSteps(0);
    stepsRef.current = [];
  }, []);

  const startVisualization = useCallback(() => {
    const algorithmMap = {
      bubble: bubbleSort,
      quick: quickSort,
      merge: mergeSort,
      heap: heapSort,
    };

    const steps = algorithmMap[selectedAlgorithm](array);
    if (steps.length === 0) {
      return; // Don't start visualization if there are no steps
    }
    stepsRef.current = steps;
    setTotalSteps(steps.length - 1);
    setCurrentStep(0);
    setIsRunning(true);
  }, [array, selectedAlgorithm]);

  const updateStepInfo = useCallback(
    (step: Step) => {
      const algorithm =
        selectedAlgorithm.charAt(0).toUpperCase() + selectedAlgorithm.slice(1);
      if (step.comparingIndices.length > 0) {
        setCurrentStepInfo(
          `${algorithm} is comparing elements at indices ${step.comparingIndices.join(
            " and "
          )}`
        );
      } else if (step.swappedIndices.length > 0) {
        setCurrentStepInfo(
          `${algorithm} swapped elements at indices ${step.swappedIndices.join(
            " and "
          )}`
        );
      } else {
        setCurrentStepInfo(`${algorithm} is in progress...`);
      }
    },
    [selectedAlgorithm]
  );

  const handleStepChange = useCallback(
    (step: number) => {
      if (step < 0 || step > stepsRef.current.length - 1) return;
      setCurrentStep(step);
      const { array: newArray } = stepsRef.current[step];
      setArray(newArray);
      updateStepInfo(stepsRef.current[step]);
    },
    [updateStepInfo]
  );

  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      setCurrentStep((prevStep) => {
        if (prevStep >= stepsRef.current.length - 1) {
          setIsRunning(false);
          return prevStep;
        }

        const nextStep = prevStep + 1;
        const { array: newArray } = stepsRef.current[nextStep];
        setArray(newArray);
        updateStepInfo(stepsRef.current[nextStep]);
        return nextStep;
      });
    };

    // Set up recurring timeout
    const intervalId = window.setInterval(
      animate,
      ANIMATION_SPEED_MAP[speed as keyof typeof ANIMATION_SPEED_MAP]
    );

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, speed, updateStepInfo]);

  const algorithms = [
    { value: "bubble", label: "Bubble Sort" },
    { value: "quick", label: "Quick Sort" },
    { value: "merge", label: "Merge Sort" },
    { value: "heap", label: "Heap Sort" },
  ];

  const getBarColor = (index: number) => {
    if (!stepsRef.current.length || currentStep >= stepsRef.current.length) {
      return blue500;
    }

    const { comparingIndices, swappedIndices } = stepsRef.current[currentStep];
    if (comparingIndices.includes(index)) return red500;
    if (swappedIndices.includes(index)) return green500;
    return blue500;
  };

  return (
    <Box>
      <VStack align="stretch" mb={4}>
        <AlgorithmControls
          state={{
            isRunning,
            speed,
            currentStep,
            totalSteps,
            algorithmType: "sorting",
            selectedAlgorithm,
          }}
          onStart={startVisualization}
          onPause={() => setIsRunning(false)}
          onReset={resetArray}
          onSpeedChange={setSpeed}
          onAlgorithmChange={(algo) => {
            setSelectedAlgorithm(algo as SortingAlgorithm);
            resetArray();
          }}
          onStepChange={handleStepChange}
          algorithms={algorithms}
        />

        <Box bg="white" p={4} shadow="sm" rounded="lg">
          <HStack spacing={4} mb={4}>
            <Box>
              <Text fontWeight="bold">Legend:</Text>
              <HStack spacing={4}>
                <HStack>
                  <Box w={4} h={4} bg={blue500} />
                  <Text>Unsorted</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg={red500} />
                  <Text>Comparing</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg={green500} />
                  <Text>Swapped</Text>
                </HStack>
              </HStack>
            </Box>
            <Text fontWeight="bold">{currentStepInfo}</Text>
          </HStack>

          <Box h="400px" position="relative" bg="gray.50" rounded="md" p={4}>
            <HStack
              spacing={1}
              align="flex-end"
              justify="center"
              h="100%"
              position="absolute"
              bottom={4}
              left={0}
              right={0}
            >
              {array.map((value, index) => (
                <Tooltip
                  key={`${index}-${value}`}
                  label={`Index: ${index}, Value: ${value}`}
                  placement="top"
                >
                  <Box
                    w={`${BAR_WIDTH}px`}
                    h={`${value}px`}
                    bg={getBarColor(index)}
                    transition="all 0.3s"
                    _hover={{
                      transform: "scaleY(1.1)",
                      transformOrigin: "bottom",
                    }}
                  />
                </Tooltip>
              ))}
            </HStack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default SortingVisualizer;
