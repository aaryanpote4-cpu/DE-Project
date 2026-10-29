/**
 * Dijkstra Shortest Path Algorithm Service
 * Computes shortest distances and paths across logistics graph nodes.
 */

function computeDijkstra(locations, edges, startId, finishId) {
  const start = parseInt(startId, 10);
  const finish = parseInt(finishId, 10);

  const graph = {};
  locations.forEach(l => { graph[l.id] = {}; });
  edges.forEach(e => {
    const s = parseInt(e.source, 10);
    const d = parseInt(e.destination, 10);
    const w = parseFloat(e.distance);
    if (!graph[s]) graph[s] = {};
    if (!graph[d]) graph[d] = {};
    graph[s][d] = w;
    graph[d][s] = w;
  });

  const distances = {};
  const previous = {};
  const unvisited = new Set();

  locations.forEach(l => {
    const id = parseInt(l.id, 10);
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  });
  distances[start] = 0;

  while (unvisited.size > 0) {
    let u = null;
    for (const v of unvisited) {
      if (u === null || distances[v] < distances[u]) {
        u = v;
      }
    }
    if (u === null || distances[u] === Infinity) break;
    unvisited.delete(u);

    if (u === finish) break;

    if (graph[u]) {
      for (const [neighborStr, weight] of Object.entries(graph[u])) {
        const neighbor = parseInt(neighborStr, 10);
        if (unvisited.has(neighbor)) {
          const alt = distances[u] + weight;
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = u;
          }
        }
      }
    }
  }

  const path = [];
  let curr = finish;
  while (curr !== null && curr !== undefined) {
    path.unshift(curr);
    if (curr === start) break;
    curr = previous[curr];
  }

  if (distances[finish] === Infinity || path[0] !== start) {
    return { distance: -1, path: [] };
  }

  return { distance: distances[finish], path };
}

module.exports = {
  computeDijkstra
};
