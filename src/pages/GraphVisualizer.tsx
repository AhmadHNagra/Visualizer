import { useState, useCallback, useRef, useEffect } from "react";
import { Box, VStack, useToken } from "@chakra-ui/react";
import type { GraphAlgorithm } from "../types";
import type { Step, Graph, GraphNode, GraphEdge } from "../algorithms/graph";
import AlgorithmControls from "../components/AlgorithmControls";
import { kruskal, prim, floydWarshall } from "../algorithms/graph";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const NODE_RADIUS = 20;
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

const generateRandomGraph = (): Graph => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Generate nodes
  for (let i = 0; i < 10; i++) {
    nodes.push({
      id: `${i}`,
      x: Math.random() * (CANVAS_WIDTH - 2 * NODE_RADIUS) + NODE_RADIUS,
      y: Math.random() * (CANVAS_HEIGHT - 2 * NODE_RADIUS) + NODE_RADIUS,
    });
  }

  // Generate edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < 0.3) {
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

      // Draw edges
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
        } else if (
          step?.visitedEdges.some(
            (e) => e.source === edge.source && e.target === edge.target
          )
        ) {
          ctx.strokeStyle = red500;
        } else {
          ctx.strokeStyle = blue500;
        }

        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw weight
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText(edge.weight.toString(), midX, midY);
      });

      // Draw nodes
      graph.nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);

        if (step?.visitedNodes.includes(node.id)) {
          ctx.fillStyle = red500;
        } else {
          ctx.fillStyle = blue500;
        }

        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isRunning) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      setCurrentStep((prevStep) => {
        // Stop if we've reached the end
        if (prevStep >= stepsRef.current.length - 1) {
          setIsRunning(false);
          return prevStep;
        }

        // Update the graph for the next step
        const nextStep = prevStep + 1;
        drawGraph(ctx, stepsRef.current[nextStep]);
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
  }, [isRunning, speed, drawGraph]);

  const algorithms = [
    { value: "kruskal", label: "Kruskal's Algorithm" },
    { value: "prim", label: "Prim's Algorithm" },
    { value: "floydWarshall", label: "Floyd-Warshall Algorithm" },
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
            algorithmType: "graph",
            selectedAlgorithm,
          }}
          onStart={startVisualization}
          onPause={() => setIsRunning(false)}
          onReset={resetGraph}
          onSpeedChange={setSpeed}
          onAlgorithmChange={(algo) =>
            setSelectedAlgorithm(algo as GraphAlgorithm)
          }
          algorithms={algorithms}
        />

        <Box bg="white" p={4} shadow="sm" rounded="lg">
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
      </VStack>
    </Box>
  );
};

export default GraphVisualizer;
