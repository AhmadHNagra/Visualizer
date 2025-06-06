import { useState, useCallback, useRef, useEffect } from "react";
import { Box, HStack, VStack, useToken } from "@chakra-ui/react";
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
  1: 100, // 1x speed (slowest)
  2: 80,
  3: 60,
  4: 45,
  5: 30,
  6: 20,
  7: 15,
  8: 10,
  9: 5,
  10: 1, // 10x speed (fastest)
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

  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      setCurrentStep((prevStep) => {
        // Stop if we've reached the end
        if (prevStep >= stepsRef.current.length - 1) {
          setIsRunning(false);
          return prevStep;
        }

        // Update the array for the next step
        const { array: newArray } = stepsRef.current[prevStep + 1];
        setArray(newArray);
        return prevStep + 1;
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
  }, [isRunning, speed]);

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
          onAlgorithmChange={(algo) =>
            setSelectedAlgorithm(algo as SortingAlgorithm)
          }
          algorithms={algorithms}
        />

        <Box
          bg="white"
          p={4}
          shadow="sm"
          rounded="lg"
          h="400px"
          position="relative"
        >
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
              <Box
                key={`${index}-${value}`}
                w={`${BAR_WIDTH}px`}
                h={`${value}px`}
                bg={getBarColor(index)}
                transition="all 0.3s"
              />
            ))}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default SortingVisualizer;
