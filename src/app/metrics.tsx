import { Graph, alg } from "graphlib";

export const MetricsDisplay = ({ nodes, edges }) => {
  const {
    numEdges,
    adjacencyMatrix,
    allPairsShortestPath,
    nodeIds,
    nodeLabels,
  } = computeMetrics(nodes, edges);

  return (
    <div>
      <h3 className="font-semibold">Graph Metrics</h3>
      <p>Number of Edges: {numEdges}</p>
      <details>
        <summary>Adjacency Matrix</summary>
        <div>
          <table className="font-mono text-sm overflow-x-scroll block">
            <thead>
              <tr>
                <th></th>
                {nodeLabels.map((label, index) => (
                  <th key={nodeIds[index]} className="px-1">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adjacencyMatrix.map((row, i) => (
                <tr key={nodeIds[i]}>
                  <td>
                    <strong>{nodeLabels[i]}</strong>
                  </td>
                  {row.map((value, j) => (
                    <td key={nodeIds[j]}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <details>
        <summary>All-Pairs Shortest Paths</summary>
        <table className="font-mono text-sm overflow-x-scroll block">
          <thead>
            <tr>
              <th>From \ To</th>
              {nodeLabels.map((label, index) => (
                <th key={nodeIds[index]} className="px-1">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodeIds.map((sourceId, i) => (
              <tr key={sourceId}>
                <td>
                  <strong>{nodeLabels[i]}</strong>
                </td>
                {nodeIds.map((targetId, j) => {
                  const pathInfo = allPairsShortestPath[sourceId][targetId];
                  const distance = pathInfo ? pathInfo.distance : "∞";
                  return (
                    <td key={targetId}>
                      {distance !== Infinity ? distance : "∞"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};

function computeMetrics(nodes, edges) {
  // Number of edges
  const numEdges = edges.length;

  // Create a graphlib Graph
  const g = new Graph({ directed: true });

  // Add nodes to the graph
  nodes.forEach((node) => {
    g.setNode(node.id.toString());
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source.toString(), edge.target.toString());
  });

  // Adjacency Matrix
  const nodeIds = nodes.map((node) => node.id.toString());
  const adjacencyMatrix = nodeIds.map((sourceId) =>
    nodeIds.map((targetId) => (g.hasEdge(sourceId, targetId) ? 1 : 0))
  );

  // All-Pairs Shortest Path
  const allPairsShortestPath = alg.floydWarshall(g);

  const nodeMap = new Map();
  nodes.forEach((node) => {
    const nodeId = node.id.toString();
    g.setNode(nodeId);
    nodeMap.set(nodeId, node.username || nodeId);
  });

  const nodeLabels = nodeIds.map((nodeId) => nodeMap.get(nodeId));

  return {
    numEdges,
    adjacencyMatrix,
    allPairsShortestPath,
    nodeIds,
    nodeLabels,
  };
}
