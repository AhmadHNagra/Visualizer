export interface GraphNode {
    id: string;
    x: number;
    y: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    weight: number;
}

export interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface Step {
    visitedNodes: string[];
    visitedEdges: GraphEdge[];
    mst?: GraphEdge[];
    distances?: { [key: string]: number };
}

class DisjointSet {
    private parent: { [key: string]: string };
    private rank: { [key: string]: number };

    constructor() {
        this.parent = {};
        this.rank = {};
    }

    makeSet(vertex: string) {
        this.parent[vertex] = vertex;
        this.rank[vertex] = 0;
    }

    find(vertex: string): string {
        if (this.parent[vertex] !== vertex) {
            this.parent[vertex] = this.find(this.parent[vertex]);
        }
        return this.parent[vertex];
    }

    union(vertex1: string, vertex2: string) {
        const root1 = this.find(vertex1);
        const root2 = this.find(vertex2);

        if (root1 !== root2) {
            if (this.rank[root1] < this.rank[root2]) {
                this.parent[root1] = root2;
            } else if (this.rank[root1] > this.rank[root2]) {
                this.parent[root2] = root1;
            } else {
                this.parent[root2] = root1;
                this.rank[root1]++;
            }
        }
    }
}

export const kruskal = (graph: Graph): Step[] => {
    const steps: Step[] = [];
    const mst: GraphEdge[] = [];
    const ds = new DisjointSet();

    // Initialize disjoint sets
    graph.nodes.forEach(node => ds.makeSet(node.id));

    // Sort edges by weight
    const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);

    for (const edge of sortedEdges) {
        const sourceRoot = ds.find(edge.source);
        const targetRoot = ds.find(edge.target);

        steps.push({
            visitedNodes: [edge.source, edge.target],
            visitedEdges: [edge],
            mst: [...mst],
        });

        if (sourceRoot !== targetRoot) {
            ds.union(edge.source, edge.target);
            mst.push(edge);

            steps.push({
                visitedNodes: [edge.source, edge.target],
                visitedEdges: [edge],
                mst: [...mst],
            });
        }
    }

    return steps;
};

export const prim = (graph: Graph): Step[] => {
    const steps: Step[] = [];
    const mst: GraphEdge[] = [];
    const visited = new Set<string>();
    const edges = new Set<GraphEdge>();

    // Start with the first node
    if (graph.nodes.length === 0) return steps;
    visited.add(graph.nodes[0].id);

    // Add all edges connected to the first node
    graph.edges
        .filter(edge => edge.source === graph.nodes[0].id || edge.target === graph.nodes[0].id)
        .forEach(edge => edges.add(edge));

    while (edges.size > 0) {
        // Find the minimum weight edge
        let minEdge: GraphEdge | null = null;
        let minWeight = Infinity;

        for (const edge of edges) {
            if (edge.weight < minWeight) {
                const sourceVisited = visited.has(edge.source);
                const targetVisited = visited.has(edge.target);
                if ((sourceVisited && !targetVisited) || (!sourceVisited && targetVisited)) {
                    minEdge = edge;
                    minWeight = edge.weight;
                }
            }
        }

        if (!minEdge) break;

        // Add the new node to visited set
        const newNode = visited.has(minEdge.source) ? minEdge.target : minEdge.source;
        visited.add(newNode);
        edges.delete(minEdge);
        mst.push(minEdge);

        steps.push({
            visitedNodes: Array.from(visited),
            visitedEdges: [minEdge],
            mst: [...mst],
        });

        // Add all edges connected to the new node
        graph.edges
            .filter(edge => (edge.source === newNode || edge.target === newNode) && !mst.includes(edge))
            .forEach(edge => edges.add(edge));
    }

    return steps;
};

export const floydWarshall = (graph: Graph): Step[] => {
    const steps: Step[] = [];
    const dist: { [key: string]: { [key: string]: number } } = {};

    // Initialize distances
    graph.nodes.forEach(i => {
        dist[i.id] = {};
        graph.nodes.forEach(j => {
            if (i.id === j.id) {
                dist[i.id][j.id] = 0;
            } else {
                const edge = graph.edges.find(
                    e => (e.source === i.id && e.target === j.id) || (e.source === j.id && e.target === i.id)
                );
                dist[i.id][j.id] = edge ? edge.weight : Infinity;
            }
        });
    });

    // Floyd-Warshall algorithm
    graph.nodes.forEach(k => {
        graph.nodes.forEach(i => {
            graph.nodes.forEach(j => {
                const throughK = dist[i.id][k.id] + dist[k.id][j.id];
                if (throughK < dist[i.id][j.id]) {
                    dist[i.id][j.id] = throughK;

                    steps.push({
                        visitedNodes: [i.id, j.id, k.id],
                        visitedEdges: [],
                        distances: Object.fromEntries(
                            graph.nodes.flatMap(source =>
                                graph.nodes.map(target =>
                                    [`${source.id}->${target.id}`, dist[source.id][target.id]]
                                )
                            )
                        ),
                    });
                }
            });
        });
    });

    return steps;
}; 