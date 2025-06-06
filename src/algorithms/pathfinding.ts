import type { Node } from '../types';

export interface Step {
    visited: Node[];
    path: Node[];
}

const getNeighbors = (node: Node, grid: Node[][]): Node[] => {
    const neighbors: Node[] = [];
    const { row, col } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]); // up
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // down
    if (col > 0) neighbors.push(grid[row][col - 1]); // left
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // right

    return neighbors.filter(neighbor => !neighbor.isWall);
};

const getDistance = (nodeA: Node, nodeB: Node): number => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
};

const getPath = (endNode: Node): Node[] => {
    const path: Node[] = [];
    let currentNode: Node | null = endNode;
    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return path;
};

export const dijkstra = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const unvisitedNodes: Node[] = [];
    const startNode = grid.flat().find(node => node.isStart);
    const endNode = grid.flat().find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    grid.forEach(row => row.forEach(node => {
        node.distance = Infinity;
        node.previousNode = null;
        unvisitedNodes.push(node);
    }));

    startNode.distance = 0;

    while (unvisitedNodes.length) {
        unvisitedNodes.sort((a, b) => a.distance - b.distance);
        const currentNode = unvisitedNodes.shift()!;

        if (currentNode.distance === Infinity) break;
        if (currentNode === endNode) {
            steps.push({ visited: [currentNode], path: getPath(endNode) });
            break;
        }

        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            const distance = currentNode.distance + 1;
            if (distance < neighbor.distance) {
                neighbor.distance = distance;
                neighbor.previousNode = currentNode;
            }
        }

        steps.push({ visited: [currentNode], path: [] });
    }

    return steps;
};

export const astar = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const openSet: Node[] = [];
    const closedSet: Node[] = [];
    const startNode = grid.flat().find(node => node.isStart);
    const endNode = grid.flat().find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    grid.forEach(row => row.forEach(node => {
        node.distance = Infinity;
        node.previousNode = null;
    }));

    startNode.distance = 0;
    openSet.push(startNode);

    while (openSet.length > 0) {
        openSet.sort((a, b) =>
            (a.distance + getDistance(a, endNode)) - (b.distance + getDistance(b, endNode))
        );

        const currentNode = openSet.shift()!;
        closedSet.push(currentNode);

        if (currentNode === endNode) {
            steps.push({ visited: [currentNode], path: getPath(endNode) });
            break;
        }

        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (closedSet.includes(neighbor)) continue;

            const tentativeDistance = currentNode.distance + 1;

            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeDistance >= neighbor.distance) {
                continue;
            }

            neighbor.previousNode = currentNode;
            neighbor.distance = tentativeDistance;
        }

        steps.push({ visited: [currentNode], path: [] });
    }

    return steps;
};

export const bfs = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const queue: Node[] = [];
    const startNode = grid.flat().find(node => node.isStart);
    const endNode = grid.flat().find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    grid.forEach(row => row.forEach(node => {
        node.previousNode = null;
    }));

    queue.push(startNode);
    const visited = new Set<Node>([startNode]);

    while (queue.length) {
        const currentNode = queue.shift()!;

        if (currentNode === endNode) {
            steps.push({ visited: [currentNode], path: getPath(endNode) });
            break;
        }

        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                neighbor.previousNode = currentNode;
                queue.push(neighbor);
            }
        }

        steps.push({ visited: [currentNode], path: [] });
    }

    return steps;
};

export const dfs = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const stack: Node[] = [];
    const startNode = grid.flat().find(node => node.isStart);
    const endNode = grid.flat().find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    grid.forEach(row => row.forEach(node => {
        node.previousNode = null;
    }));

    stack.push(startNode);
    const visited = new Set<Node>([startNode]);

    while (stack.length) {
        const currentNode = stack.pop()!;

        if (currentNode === endNode) {
            steps.push({ visited: [currentNode], path: getPath(endNode) });
            break;
        }

        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                neighbor.previousNode = currentNode;
                stack.push(neighbor);
            }
        }

        steps.push({ visited: [currentNode], path: [] });
    }

    return steps;
};

const getDiagonalNeighbors = (node: Node, grid: Node[][]): Node[] => {
    const neighbors: Node[] = [];
    const { row, col } = node;

    // Check all 8 directions
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],  // top-left, top, top-right
        [0, -1], [0, 1],    // left, right
        [1, -1], [1, 0], [1, 1]     // bottom-left, bottom, bottom-right
    ];

    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;

        if (newRow >= 0 && newRow < grid.length &&
            newCol >= 0 && newCol < grid[0].length &&
            !grid[newRow][newCol].isWall) {
            neighbors.push(grid[newRow][newCol]);
        }
    }

    return neighbors;
};

// Greedy Best-First Search
export const greedyBestFirst = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const openSet: Node[] = [];
    const closedSet: Node[] = [];
    const startNode = grid.flat().find(node => node.isStart);
    const endNode = grid.flat().find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    grid.forEach(row => row.forEach(node => {
        node.previousNode = null;
    }));

    startNode.distance = 0;
    openSet.push(startNode);

    while (openSet.length > 0) {
        // Sort by heuristic (distance to end) only
        openSet.sort((a, b) =>
            getDistance(a, endNode) - getDistance(b, endNode)
        );

        const currentNode = openSet.shift()!;
        closedSet.push(currentNode);

        if (currentNode === endNode) {
            steps.push({ visited: [currentNode], path: getPath(endNode) });
            break;
        }

        const neighbors = getNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (closedSet.includes(neighbor)) continue;

            if (!openSet.includes(neighbor)) {
                neighbor.previousNode = currentNode;
                openSet.push(neighbor);
            }
        }

        steps.push({ visited: [currentNode], path: [] });
    }

    return steps;
};

// Add this helper function to get path in reverse
const getReversePath = (node: Node): Node[] => {
    const path: Node[] = [];
    let currentNode: Node | null = node;
    while (currentNode !== null) {
        path.push(currentNode);
        currentNode = currentNode.previousNode;
    }
    return path;
};

// Update the bidirectional search implementation
export const bidirectionalSearch = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const forwardQueue: Node[] = [];
    const backwardQueue: Node[] = [];
    const forwardVisited = new Set<Node>();
    const backwardVisited = new Set<Node>();
    const startNode = grid.flat().find(node => node.isStart);
    const endNode = grid.flat().find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    // Initialize nodes
    grid.forEach(row => row.forEach(node => {
        node.previousNode = null;
        node.distance = Infinity;
    }));

    // Set up forward search
    startNode.distance = 0;
    forwardQueue.push(startNode);
    forwardVisited.add(startNode);

    // Set up backward search
    endNode.distance = 0;
    backwardQueue.push(endNode);
    backwardVisited.add(endNode);

    let intersectionNode: Node | null = null;
    let forwardPath: Node[] = [];
    let backwardPath: Node[] = [];

    while (forwardQueue.length && backwardQueue.length) {
        // Forward search
        const forwardNode = forwardQueue.shift()!;
        if (backwardVisited.has(forwardNode)) {
            intersectionNode = forwardNode;
            // Get path from start to intersection
            forwardPath = getPath(forwardNode);
            // Get path from intersection to end
            backwardPath = getReversePath(forwardNode);
            break;
        }

        const forwardNeighbors = getNeighbors(forwardNode, grid);
        for (const neighbor of forwardNeighbors) {
            if (!forwardVisited.has(neighbor)) {
                forwardVisited.add(neighbor);
                neighbor.previousNode = forwardNode;
                forwardQueue.push(neighbor);
            }
        }

        // Backward search
        const backwardNode = backwardQueue.shift()!;
        if (forwardVisited.has(backwardNode)) {
            intersectionNode = backwardNode;
            // Get path from start to intersection
            forwardPath = getPath(backwardNode);
            // Get path from intersection to end
            backwardPath = getReversePath(backwardNode);
            break;
        }

        const backwardNeighbors = getNeighbors(backwardNode, grid);
        for (const neighbor of backwardNeighbors) {
            if (!backwardVisited.has(neighbor)) {
                backwardVisited.add(neighbor);
                neighbor.previousNode = backwardNode;
                backwardQueue.push(neighbor);
            }
        }

        steps.push({
            visited: [...forwardVisited, ...backwardVisited],
            path: []
        });
    }

    // If we found an intersection, construct the complete path
    if (intersectionNode) {
        // Combine paths, removing the intersection node from one path to avoid duplication
        const completePath = [...forwardPath, ...backwardPath.slice(1)];
        steps.push({
            visited: [...forwardVisited, ...backwardVisited],
            path: completePath
        });
    }

    return steps;
};

// Jump Point Search
export const jumpPointSearch = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const openSet: Node[] = [];
    const closedSet: Node[] = [];
    const startNode = grid.flat().find(node => node.isStart);
    const endNode = grid.flat().find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    grid.forEach(row => row.forEach(node => {
        node.distance = Infinity;
        node.previousNode = null;
    }));

    startNode.distance = 0;
    openSet.push(startNode);

    const findJumpPoint = (current: Node, direction: [number, number]): Node | null => {
        const [dx, dy] = direction;
        const nextRow = current.row + dx;
        const nextCol = current.col + dy;

        // Check if next position is within grid bounds
        if (nextRow < 0 || nextRow >= grid.length ||
            nextCol < 0 || nextCol >= grid[0].length ||
            grid[nextRow][nextCol].isWall) {
            return null;
        }

        const next = grid[nextRow][nextCol];
        if (next === endNode) return next;

        // Check for forced neighbors
        if (dx !== 0 && dy !== 0) {
            // Diagonal movement
            // Check if we can move in the x direction
            if (nextRow - dx >= 0 && nextRow - dx < grid.length) {
                // Check if we can move in the y direction
                if (nextCol + dy >= 0 && nextCol + dy < grid[0].length) {
                    if (!grid[nextRow - dx][nextCol].isWall &&
                        grid[nextRow - dx][nextCol + dy].isWall) {
                        return next;
                    }
                }
            }
            // Check if we can move in the y direction
            if (nextCol - dy >= 0 && nextCol - dy < grid[0].length) {
                // Check if we can move in the x direction
                if (nextRow + dx >= 0 && nextRow + dx < grid.length) {
                    if (!grid[nextRow][nextCol - dy].isWall &&
                        grid[nextRow + dx][nextCol - dy].isWall) {
                        return next;
                    }
                }
            }
        } else {
            // Straight movement
            if (dx !== 0) {
                // Horizontal movement
                if (nextCol + 1 >= 0 && nextCol + 1 < grid[0].length) {
                    if (nextRow + dx >= 0 && nextRow + dx < grid.length) {
                        if (!grid[nextRow][nextCol + 1].isWall &&
                            grid[nextRow + dx][nextCol + 1].isWall) {
                            return next;
                        }
                    }
                }
                if (nextCol - 1 >= 0 && nextCol - 1 < grid[0].length) {
                    if (nextRow + dx >= 0 && nextRow + dx < grid.length) {
                        if (!grid[nextRow][nextCol - 1].isWall &&
                            grid[nextRow + dx][nextCol - 1].isWall) {
                            return next;
                        }
                    }
                }
            } else {
                // Vertical movement
                if (nextRow + 1 >= 0 && nextRow + 1 < grid.length) {
                    if (nextCol + dy >= 0 && nextCol + dy < grid[0].length) {
                        if (!grid[nextRow + 1][nextCol].isWall &&
                            grid[nextRow + 1][nextCol + dy].isWall) {
                            return next;
                        }
                    }
                }
                if (nextRow - 1 >= 0 && nextRow - 1 < grid.length) {
                    if (nextCol + dy >= 0 && nextCol + dy < grid[0].length) {
                        if (!grid[nextRow - 1][nextCol].isWall &&
                            grid[nextRow - 1][nextCol + dy].isWall) {
                            return next;
                        }
                    }
                }
            }
        }

        // Recursively check
        const jumpPoint = findJumpPoint(next, direction);
        if (jumpPoint) {
            const distance = next.distance + getDistance(next, jumpPoint);
            if (distance < jumpPoint.distance) {
                jumpPoint.distance = distance;
                jumpPoint.previousNode = next;
                if (!openSet.includes(jumpPoint)) {
                    openSet.push(jumpPoint);
                }
            }
        }

        return null;
    };

    while (openSet.length > 0) {
        openSet.sort((a, b) =>
            (a.distance + getDistance(a, endNode)) - (b.distance + getDistance(b, endNode))
        );

        const currentNode = openSet.shift()!;
        closedSet.push(currentNode);

        if (currentNode === endNode) {
            steps.push({ visited: [currentNode], path: getPath(endNode) });
            break;
        }

        const neighbors = getDiagonalNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (closedSet.includes(neighbor)) continue;

            const direction: [number, number] = [
                neighbor.row - currentNode.row,
                neighbor.col - currentNode.col
            ];

            const jumpPoint = findJumpPoint(currentNode, direction);
            if (jumpPoint) {
                const distance = currentNode.distance + getDistance(currentNode, jumpPoint);
                if (distance < jumpPoint.distance) {
                    jumpPoint.distance = distance;
                    jumpPoint.previousNode = currentNode;
                    if (!openSet.includes(jumpPoint)) {
                        openSet.push(jumpPoint);
                    }
                }
            }
        }

        steps.push({ visited: [currentNode], path: [] });
    }

    if (steps.length === 0) {
        // Fallback: mark the start node as visited if nothing else
        steps.push({ visited: [startNode], path: [] });
    }
    return steps;
};

// Bellman-Ford Algorithm
export const bellmanFord = (grid: Node[][]): Step[] => {
    const steps: Step[] = [];
    const nodes = grid.flat();
    const startNode = nodes.find(node => node.isStart);
    const endNode = nodes.find(node => node.isEnd);

    if (!startNode || !endNode) return steps;

    // Initialize distances
    nodes.forEach(node => {
        node.distance = Infinity;
        node.previousNode = null;
    });
    startNode.distance = 0;

    // Create edges (connections between non-wall nodes)
    const edges: { from: Node; to: Node }[] = [];
    nodes.forEach(node => {
        if (!node.isWall) {
            getNeighbors(node, grid).forEach(neighbor => {
                edges.push({ from: node, to: neighbor });
            });
        }
    });

    // Bellman-Ford algorithm
    for (let i = 0; i < nodes.length - 1; i++) {
        let updated = false;
        for (const { from, to } of edges) {
            if (from.distance + 1 < to.distance) {
                to.distance = from.distance + 1;
                to.previousNode = from;
                updated = true;
            }
        }
        if (!updated) break;
    }

    // Check for negative cycles (not applicable in our case, but included for completeness)
    for (const { from, to } of edges) {
        if (from.distance + 1 < to.distance) {
            console.warn("Negative cycle detected");
            return steps;
        }
    }

    // Create steps for visualization
    const visited = new Set<Node>();
    let currentNode: Node | null = endNode;
    while (currentNode) {
        visited.add(currentNode);
        currentNode = currentNode.previousNode;
    }

    steps.push({
        visited: Array.from(visited),
        path: getPath(endNode)
    });

    if (steps.length === 0) {
        steps.push({ visited: [startNode], path: [] });
    }
    return steps;
}; 