import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  useToken,
  VStack,
  HStack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import type { Node, PathfindingAlgorithm } from "../types";
import type { Step } from "../algorithms/pathfinding";
import AlgorithmControls from "../components/AlgorithmControls";
import {
  dijkstra,
  astar,
  bfs,
  dfs,
  greedyBestFirst,
  bidirectionalSearch,
} from "../algorithms/pathfinding";

const GRID_ROWS = 20;
const GRID_COLS = 30;
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

const createNode = (row: number, col: number): Node => ({
  row,
  col,
  isWall: false,
  isStart: row === 10 && col === 5,
  isEnd: row === 10 && col === 25,
  isVisited: false,
  isPath: false,
  distance: Infinity,
  previousNode: null,
});

const createInitialGrid = (): Node[][] => {
  const grid: Node[][] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const currentRow: Node[] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState<Node[][]>(() => createInitialGrid());
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<PathfindingAlgorithm>("dijkstra");
  const [currentStepInfo, setCurrentStepInfo] = useState<string>("");
  const [blue500, green500, red500, gray700] = useToken("colors", [
    "blue.500",
    "green.500",
    "red.500",
    "gray.700",
  ]);

  const animationFrameId = useRef<number>();
  const isMousePressed = useRef(false);
  const stepsRef = useRef<Step[]>([]);

  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return;

    const newGrid = grid.map((rowArray) =>
      rowArray.map((node) => ({
        ...node,
        isWall:
          node.row === row && node.col === col ? !node.isWall : node.isWall,
      }))
    );

    setGrid(newGrid);
    isMousePressed.current = true;
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isMousePressed.current || isRunning) return;

    const newGrid = grid.map((rowArray) =>
      rowArray.map((node) => ({
        ...node,
        isWall:
          node.row === row && node.col === col ? !node.isWall : node.isWall,
      }))
    );

    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    isMousePressed.current = false;
  };

  const resetGrid = useCallback(() => {
    if (animationFrameId.current) {
      clearTimeout(animationFrameId.current);
    }
    setGrid(createInitialGrid());
    setIsRunning(false);
    setCurrentStep(0);
    setTotalSteps(0);
    stepsRef.current = [];
  }, []);

  const visualizeStep = useCallback((step: number) => {
    const { path } = stepsRef.current[step];

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          isPath: false,
        }))
      );

      // Mark all nodes visited up to current step
      for (let i = 0; i <= step; i++) {
        stepsRef.current[i].visited.forEach((node) => {
          newGrid[node.row][node.col].isVisited = true;
        });
      }

      // Mark path if available
      if (path.length > 0) {
        path.forEach((node) => {
          newGrid[node.row][node.col].isPath = true;
        });
      }

      return newGrid;
    });
  }, []);

  const updateStepInfo = useCallback(
    (step: Step) => {
      const algorithm =
        selectedAlgorithm.charAt(0).toUpperCase() + selectedAlgorithm.slice(1);
      if (step.path.length > 0) {
        setCurrentStepInfo(`${algorithm} found a path!`);
      } else {
        setCurrentStepInfo(`${algorithm} is exploring the grid...`);
      }
    },
    [selectedAlgorithm]
  );

  const startVisualization = useCallback(() => {
    const algorithmMap = {
      dijkstra,
      astar,
      bfs,
      dfs,
      greedyBestFirst,
      bidirectionalSearch,
    };

    const steps = algorithmMap[selectedAlgorithm](grid);
    if (steps.length === 0) {
      return;
    }
    stepsRef.current = steps;
    setTotalSteps(steps.length - 1);
    setCurrentStep(0);
    setIsRunning(true);
  }, [grid, selectedAlgorithm]);

  const handleStepChange = useCallback(
    (step: number) => {
      if (step < 0 || step > stepsRef.current.length - 1) return;
      setCurrentStep(step);
      visualizeStep(step);
      updateStepInfo(stepsRef.current[step]);
    },
    [visualizeStep, updateStepInfo]
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
        visualizeStep(nextStep);
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
  }, [isRunning, speed, visualizeStep, updateStepInfo]);

  const algorithms = [
    { value: "dijkstra", label: "Dijkstra's Algorithm" },
    { value: "astar", label: "A* Search" },
    { value: "bfs", label: "Breadth First Search" },
    { value: "dfs", label: "Depth First Search" },
    { value: "greedyBestFirst", label: "Greedy Best-First Search" },
    { value: "bidirectionalSearch", label: "Bidirectional Search" },
  ];

  return (
    <Box>
      <VStack align="stretch" mb={4}>
        <AlgorithmControls
          state={{
            isRunning,
            speed,
            currentStep,
            totalSteps,
            algorithmType: "pathfinding",
            selectedAlgorithm,
          }}
          onStart={startVisualization}
          onPause={() => setIsRunning(false)}
          onReset={resetGrid}
          onSpeedChange={setSpeed}
          onAlgorithmChange={(algo) => {
            setSelectedAlgorithm(algo as PathfindingAlgorithm);
            resetGrid();
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
                  <Box w={4} h={4} bg={green500} rounded="sm" />
                  <Text>Start</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg={red500} rounded="sm" />
                  <Text>End</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg={blue500} rounded="sm" />
                  <Text>Path</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg="blue.200" rounded="sm" />
                  <Text>Visited</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg={gray700} rounded="sm" />
                  <Text>Wall</Text>
                </HStack>
              </HStack>
            </Box>
            <Text fontWeight="bold">{currentStepInfo}</Text>
          </HStack>

          <Box position="relative">
            <Grid
              templateColumns={`repeat(${GRID_COLS}, 25px)`}
              gap={0}
              justifyContent="center"
              onMouseLeave={handleMouseUp}
            >
              {grid.map((row, rowIdx) =>
                row.map((node, colIdx) => (
                  <Tooltip
                    key={`${rowIdx}-${colIdx}`}
                    label={`${
                      node.isStart ? "Start" : node.isEnd ? "End" : ""
                    } ${node.isWall ? "Wall" : ""} ${
                      node.isVisited ? "Visited" : ""
                    } ${node.isPath ? "Path" : ""}`}
                    placement="top"
                  >
                    <Box
                      w="25px"
                      h="25px"
                      border="1px"
                      borderColor="gray.200"
                      bg={
                        node.isStart
                          ? green500
                          : node.isEnd
                          ? red500
                          : node.isPath
                          ? blue500
                          : node.isVisited
                          ? "blue.200"
                          : node.isWall
                          ? gray700
                          : "white"
                      }
                      transition="all 0.3s"
                      cursor={isRunning ? "default" : "pointer"}
                      onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                      onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                      onMouseUp={handleMouseUp}
                      _hover={{
                        transform: "scale(1.1)",
                        zIndex: 1,
                      }}
                    />
                  </Tooltip>
                ))
              )}
            </Grid>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default PathfindingVisualizer;
