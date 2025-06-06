import { useState, useCallback, useRef, useEffect } from "react";
import { Box, Grid, useToken, VStack } from "@chakra-ui/react";
import type { Node, PathfindingAlgorithm } from "../types";
import type { Step } from "../algorithms/pathfinding";
import AlgorithmControls from "../components/AlgorithmControls";
import { dijkstra, astar, bfs, dfs } from "../algorithms/pathfinding";

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
  const [blue500] = useToken("colors", ["blue.500"]);

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

  const startVisualization = useCallback(() => {
    const algorithmMap = {
      dijkstra,
      astar,
      bfs,
      dfs,
    };

    const steps = algorithmMap[selectedAlgorithm](grid);
    console.log(steps);
    if (steps.length === 0) {
      return; // Don't start visualization if there are no steps
    }
    stepsRef.current = steps;
    setTotalSteps(steps.length - 1);
    setCurrentStep(0);
    setIsRunning(true);
  }, [grid, selectedAlgorithm]);

  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      setCurrentStep((prevStep) => {
        // Stop if we've reached the end
        if (prevStep >= stepsRef.current.length - 1) {
          setIsRunning(false);
          return prevStep;
        }

        // Visualize the next step
        const nextStep = prevStep + 1;
        visualizeStep(nextStep);
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
  }, [isRunning, speed, visualizeStep]);

  const algorithms = [
    { value: "dijkstra", label: "Dijkstra's Algorithm" },
    { value: "astar", label: "A* Search" },
    { value: "bfs", label: "Breadth First Search" },
    { value: "dfs", label: "Depth First Search" },
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
          onAlgorithmChange={(algo) =>
            setSelectedAlgorithm(algo as PathfindingAlgorithm)
          }
          algorithms={algorithms}
        />

        <Box
          bg="white"
          p={4}
          shadow="sm"
          rounded="lg"
          onMouseLeave={handleMouseUp}
        >
          <Grid
            templateColumns={`repeat(${GRID_COLS}, 25px)`}
            gap={0}
            justifyContent="center"
          >
            {grid.map((row, rowIdx) =>
              row.map((node, colIdx) => (
                <Box
                  key={`${rowIdx}-${colIdx}`}
                  w="25px"
                  h="25px"
                  border="1px"
                  borderColor="gray.200"
                  bg={
                    node.isStart
                      ? "green.500"
                      : node.isEnd
                      ? "red.500"
                      : node.isPath
                      ? blue500
                      : node.isVisited
                      ? "blue.200"
                      : node.isWall
                      ? "gray.700"
                      : "white"
                  }
                  transition="all 0.3s"
                  cursor={isRunning ? "default" : "pointer"}
                  onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onMouseUp={handleMouseUp}
                />
              ))
            )}
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
};

export default PathfindingVisualizer;
