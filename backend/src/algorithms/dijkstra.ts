import { Graph } from "../dataStructures/Graph";

interface PriorityQueueNode {
  id: string;
  distance: number;
}

class PriorityQueue {
  private values: PriorityQueueNode[] = [];

  enqueue(id: string, distance: number) {
    this.values.push({ id, distance });
    this.sort();
  }

  dequeue() {
    return this.values.shift();
  }

  sort() {
    this.values.sort((a, b) => a.distance - b.distance);
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

export function dijkstra(graph: Graph, start: string, finish: string): { distance: number; path: string[] } {
  const nodes = new PriorityQueue();
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  let path: string[] = []; // to return at end
  let smallest: string;

  // Initial state setup
  for (let vertex of graph.getVertices()) {
    if (vertex === start) {
      distances[vertex] = 0;
      nodes.enqueue(vertex, 0);
    } else {
      distances[vertex] = Infinity;
      nodes.enqueue(vertex, Infinity);
    }
    previous[vertex] = null;
  }

  // As long as there is something to visit
  while (!nodes.isEmpty()) {
    const dequeued = nodes.dequeue();
    if (!dequeued) break;
    smallest = dequeued.id;

    if (smallest === finish) {
      // We are done. Build path to return.
      while (previous[smallest]) {
        path.push(smallest);
        smallest = previous[smallest] as string;
      }
      break;
    }

    if (smallest && distances[smallest] !== Infinity) {
      const neighbors = graph.getNeighbors(smallest);
      for (let neighbor of neighbors) {
        // Calculate distance to neighboring node
        let candidate = distances[smallest] + neighbor.weight;
        let nextNeighbor = neighbor.node;

        if (candidate < distances[nextNeighbor]) {
          // Updating new smallest distance to neighbor
          distances[nextNeighbor] = candidate;
          // Updating previous - How we got to next neighbor
          previous[nextNeighbor] = smallest;
          // Enqueue in priority queue with new priority
          nodes.enqueue(nextNeighbor, candidate);
        }
      }
    }
  }

  // Ensure start node is added to path if we found a path
  if (distances[finish] !== Infinity) {
      path = path.concat(start).reverse();
  } else {
      return { distance: Infinity, path: [] };
  }

  return { distance: distances[finish], path };
}
