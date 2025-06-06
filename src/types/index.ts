export type AlgorithmType = 'pathfinding' | 'sorting' | 'graph';

export type PathfindingAlgorithm = 'astar' | 'dijkstra' | 'bfs' | 'dfs';
export type SortingAlgorithm = 'bubble' | 'quick' | 'merge' | 'heap';
export type GraphAlgorithm = 'kruskal' | 'prim' | 'floydWarshall';

export interface Node {
    row: number;
    col: number;
    isWall: boolean;
    isStart: boolean;
    isEnd: boolean;
    isVisited: boolean;
    isPath: boolean;
    distance: number;
    previousNode: Node | null;
}

export interface AlgorithmState {
    isRunning: boolean;
    speed: number;
    currentStep: number;
    totalSteps: number;
    algorithmType: AlgorithmType;
    selectedAlgorithm: PathfindingAlgorithm | SortingAlgorithm | GraphAlgorithm;
}

export interface VisualizerProps {
    algorithmType: AlgorithmType;
    selectedAlgorithm: PathfindingAlgorithm | SortingAlgorithm | GraphAlgorithm;
    speed: number;
    onVisualizationComplete: () => void;
} 