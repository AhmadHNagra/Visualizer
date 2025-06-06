import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  useToken,
  HStack,
  Text,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import type { GraphAlgorithm } from "../types";
import type { Step, Graph, GraphNode, GraphEdge } from "../algorithms/graph";
import AlgorithmControls from "../components/AlgorithmControls";
import { kruskal, prim, floydWarshall } from "../algorithms/graph";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const NODE_RADIUS = 20;
const MIN_NODE_DISTANCE = NODE_RADIUS * 3; // Minimum distance between nodes
const PADDING = NODE_RADIUS * 2; // Padding from canvas edges
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

// Add this new function to check if a position is valid
const isValidPosition = (
  x: number,
  y: number,
  nodes: GraphNode[],
  minDistance: number
): boolean => {
  // Check if position is within canvas bounds with padding
  if (
    x < PADDING ||
    x > CANVAS_WIDTH - PADDING ||
    y < PADDING ||
    y > CANVAS_HEIGHT - PADDING
  ) {
    return false;
  }

  // Check distance from other nodes
  return !nodes.some(
    (node) =>
      Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) < minDistance
  );
};

// Add this function to find a valid position for a node
const findValidPosition = (
  nodes: GraphNode[],
  minDistance: number
): { x: number; y: number } => {
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const x = Math.random() * (CANVAS_WIDTH - 2 * PADDING) + PADDING;
    const y = Math.random() * (CANVAS_HEIGHT - 2 * PADDING) + PADDING;

    if (isValidPosition(x, y, nodes, minDistance)) {
      return { x, y };
    }
    attempts++;
  }

  // If no valid position found, return a position that's at least not overlapping
  return {
    x: Math.random() * (CANVAS_WIDTH - 2 * PADDING) + PADDING,
    y: Math.random() * (CANVAS_HEIGHT - 2 * PADDING) + PADDING,
  };
};

const generateRandomGraph = (): Graph => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Generate nodes with better spacing
  for (let i = 0; i < 10; i++) {
    const position = findValidPosition(nodes, MIN_NODE_DISTANCE);
    nodes.push({
      id: `${i}`,
      x: position.x,
      y: position.y,
    });
  }

  // Generate edges with a lower probability to reduce visual clutter
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < 0.25) {
        // Reduced from 0.3 to 0.25
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          weight: Math.floor(Math.random() * 10) + 1,
        });
      }
    }
  }

  return { nodes, edges };
};

const GraphVisualizer = () => {
  const [graph, setGraph] = useState<Graph>(() => generateRandomGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<GraphAlgorithm>("kruskal");
  const [blue500, green500, red500] = useToken("colors", [
    "blue.500",
    "green.500",
    "red.500",
  ]);
  const [currentStepInfo, setCurrentStepInfo] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const stepsRef = useRef<Step[]>([]);

  const resetGraph = useCallback(() => {
    if (animationFrameId.current) {
      clearTimeout(animationFrameId.current);
    }
    setGraph(generateRandomGraph());
    setIsRunning(false);
    setCurrentStep(0);
    setTotalSteps(0);
    stepsRef.current = [];
  }, []);

  const drawGraph = useCallback(
    (ctx: CanvasRenderingContext2D, step?: Step) => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw edges with improved visibility
      graph.edges.forEach((edge) => {
        const sourceNode = graph.nodes.find((n) => n.id === edge.source)!;
        const targetNode = graph.nodes.find((n) => n.id === edge.target)!;

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);

        if (
          step?.mst?.some(
            (e) => e.source === edge.source && e.target === edge.target
          )
        ) {
          ctx.strokeStyle = green500;
          ctx.lineWidth = 4; // Thicker line for MST edges
        } else if (
          step?.visitedEdges.some(
            (e) => e.source === edge.source && e.target === edge.target
          )
        ) {
          ctx.strokeStyle = red500;
          ctx.lineWidth = 3; // Medium line for visited edges
        } else {
          ctx.strokeStyle = blue500;
          ctx.lineWidth = 2; // Normal line for unvisited edges
        }

        ctx.stroke();

        // Draw weight with background for better visibility
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(midX - 15, midY - 10, 30, 20);
        ctx.fillStyle = "black";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(edge.weight.toString(), midX, midY);
      });

      // Draw nodes with improved visibility
      graph.nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);

        if (step?.visitedNodes.includes(node.id)) {
          ctx.fillStyle = red500;
        } else {
          ctx.fillStyle = blue500;
        }

        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.id, node.x, node.y);
      });
    },
    [graph, blue500, green500, red500]
  );

  const startVisualization = useCallback(() => {
    const algorithmMap = {
      kruskal,
      prim,
      floydWarshall,
    };

    const steps = algorithmMap[selectedAlgorithm](graph);
    if (steps.length === 0) {
      return; // Don't start visualization if there are no steps
    }
    stepsRef.current = steps;
    setTotalSteps(steps.length - 1);
    setCurrentStep(0);
    setIsRunning(true);
  }, [graph, selectedAlgorithm]);

  // Update step info based on algorithm and current step
  const updateStepInfo = useCallback(
    (step: Step) => {
      if (selectedAlgorithm === "floydWarshall" && step.distances) {
        setCurrentStepInfo(
          "Updating shortest paths between all pairs of nodes"
        );
      } else if (selectedAlgorithm === "kruskal") {
        setCurrentStepInfo(
          "Finding minimum spanning tree using Kruskal's algorithm"
        );
      } else if (selectedAlgorithm === "prim") {
        setCurrentStepInfo(
          "Finding minimum spanning tree using Prim's algorithm"
        );
      }
    },
    [selectedAlgorithm]
  );

  const handleStepChange = useCallback(
    (step: number) => {
      if (step < 0 || step > stepsRef.current.length - 1) return;
      setCurrentStep(step);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawGraph(ctx, stepsRef.current[step]);
        updateStepInfo(stepsRef.current[step]);
      }
    },
    [drawGraph, updateStepInfo]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isRunning) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      setCurrentStep((prevStep) => {
        if (prevStep >= stepsRef.current.length - 1) {
          setIsRunning(false);
          return prevStep;
        }

        const nextStep = prevStep + 1;
        drawGraph(ctx, stepsRef.current[nextStep]);
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
  }, [isRunning, speed, drawGraph, updateStepInfo]);

  const algorithms = [
    { value: "kruskal", label: "Kruskal's Algorithm" },
    { value: "prim", label: "Prim's Algorithm" },
    { value: "floydWarshall", label: "Floyd-Warshall Algorithm" },
  ];

  // Render distance matrix for Floyd-Warshall
  const renderDistanceMatrix = () => {
    if (
      selectedAlgorithm !== "floydWarshall" ||
      !stepsRef.current[currentStep]?.distances
    ) {
      return null;
    }

    const distances = stepsRef.current[currentStep].distances!;
    const nodes = graph.nodes.map((n) => n.id);

    return (
      <Box mt={4} p={4} bg="white" shadow="sm" rounded="lg" overflowX="auto">
        <Text mb={2} fontWeight="bold">
          Distance Matrix
        </Text>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th></Th>
              {nodes.map((node) => (
                <Th key={node}>{node}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {nodes.map((source) => (
              <Tr key={source}>
                <Th>{source}</Th>
                {nodes.map((target) => (
                  <Td key={`${source}-${target}`}>
                    {distances[`${source}->${target}`] === Infinity
                      ? "∞"
                      : distances[`${source}->${target}`]}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
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
            algorithmType: "graph",
            selectedAlgorithm,
          }}
          onStart={startVisualization}
          onPause={() => setIsRunning(false)}
          onReset={resetGraph}
          onSpeedChange={setSpeed}
          onAlgorithmChange={(algo) => {
            setSelectedAlgorithm(algo as GraphAlgorithm);
            resetGraph();
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
                  <Box w={4} h={4} bg={blue500} rounded="full" />
                  <Text>Unvisited</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg={red500} rounded="full" />
                  <Text>Visited</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg={green500} rounded="full" />
                  <Text>MST Edge</Text>
                </HStack>
              </HStack>
            </Box>
            <Text fontWeight="bold">{currentStepInfo}</Text>
          </HStack>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>

        {renderDistanceMatrix()}
      </VStack>
    </Box>
  );
};

export default GraphVisualizer;
