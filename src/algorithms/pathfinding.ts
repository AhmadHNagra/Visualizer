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