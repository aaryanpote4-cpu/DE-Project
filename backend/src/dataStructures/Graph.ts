export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Edge {
  source: string;
  destination: string;
  distance: number;
}

export class Graph {
  private adjacencyList: Map<string, { node: string; weight: number }[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(id: string) {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
  }

  addEdge(source: string, destination: string, weight: number) {
    this.addVertex(source);
    this.addVertex(destination);

    // Adding directed edge. For bi-directional, addEdge should be called twice from API or handled here.
    // We will assume directed edges as per standard graph problems, giving more control.
    this.adjacencyList.get(source)?.push({ node: destination, weight });
  }

  getNeighbors(id: string) {
    return this.adjacencyList.get(id) || [];
  }

  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }
}
