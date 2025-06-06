# Algorithm Visualizer

A web application to visualize classic algorithms in action. Built with React, TypeScript, and Chakra UI.

## Features

### Pathfinding Algorithms
- A* Search
- Dijkstra's Algorithm
- Breadth First Search (BFS)
- Depth First Search (DFS)

### Sorting Algorithms
- Bubble Sort
- Quick Sort
- Merge Sort
- Heap Sort

### Graph Algorithms
- Kruskal's Minimum Spanning Tree
- Prim's Minimum Spanning Tree
- Floyd-Warshall Shortest Path

## Controls

- Algorithm Selection: Choose from different algorithms in each category
- Speed Control: Adjust visualization speed (1x to 5x)
- Step Navigation: Start, pause, and reset the visualization
- Interactive Grid: Click and drag to create walls (Pathfinding)
- Dynamic Graph: Randomly generated weighted graphs (Graph Algorithms)

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd algorithm-visualizer
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Technologies Used

- React
- TypeScript
- Chakra UI
- HTML Canvas (for Graph Visualization)

## Project Structure

```
src/
├── algorithms/        # Algorithm implementations
│   ├── pathfinding.ts
│   ├── sorting.ts
│   └── graph.ts
├── components/        # Reusable React components
│   ├── AlgorithmControls.tsx
│   └── Navbar.tsx
├── pages/            # Main visualizer components
│   ├── Home.tsx
│   ├── PathfindingVisualizer.tsx
│   ├── SortingVisualizer.tsx
│   └── GraphVisualizer.tsx
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main application component
└── main.tsx         # Application entry point
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License
