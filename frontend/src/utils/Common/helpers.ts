export const hideValue = (value: string, sign = "*") => sign?.repeat(value?.length)

// Generic type for nodes with id property
interface NodeWithId {
  id: string;
  [key: string]: unknown;
}

// Generic type for edges with source and target
interface EdgeWithSourceTarget {
  source: string;
  target: string;
  [key: string]: unknown;
}

export const sortNodesInFlowOrder = <T extends NodeWithId, E extends EdgeWithSourceTarget>(
  nodesToSort: T[],
  edgesToSort: E[]
): T[] => {
  // Create adjacency map
  const adjacencyMap = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize all nodes
  nodesToSort.forEach(node => {
    adjacencyMap.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  // Build graph
  edgesToSort.forEach(edge => {
    adjacencyMap.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });
  
  // Topological sort (Kahn's algorithm)
  const queue: string[] = [];
  const sorted: string[] = [];
  
  // Find all nodes with no incoming edges
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });
  
  // Process queue
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    sorted.push(nodeId);
    
    const neighbors = adjacencyMap.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  // Create a map for quick node lookup
  const nodeMap = new Map(nodesToSort.map(node => [node.id, node]));
  
  // Return sorted nodes, fallback to original order if cycle detected
  if (sorted.length === nodesToSort.length) {
    return sorted.map(id => nodeMap.get(id)!);
  }
  return nodesToSort;
}

/**
 * Get label text for If node condition handles
 */
export const getLabelForHandle = (handleId: string): string => {
  if (handleId === 'if') return 'if';
  if (handleId === 'else') return 'else';
  if (handleId === 'exit') return 'exit';
  if (handleId.startsWith('elseif')) return 'else if';
  return '';
};

/**
 * Get color for If node condition handles
 */
export const getColorForHandle = (handleId: string): string => {
  if (handleId === 'if') return '#4caf50'; // green
  if (handleId === 'else') return '#4caf50'; // green
  if (handleId === 'exit') return '#000000'; // black for continuation
  if (handleId.startsWith('elseif')) return '#4caf50'; // green
  return '#555';
};

/**
 * Get nodes following a specific handle from an If node (used in code generation)
 */
export const getNodesInBranch = <T extends NodeWithId, E extends EdgeWithSourceTarget>(
  startNodeId: string,
  handleId: string | null,
  nodes: T[],
  edges: E[],
  visitedNodes: Set<string> = new Set()
): T[] => {
  const branchNodes: T[] = [];
  
  // Find the edge from this node and handle
  const outgoingEdges = edges.filter(
    (edge) => edge.source === startNodeId && (handleId === null || (edge as { sourceHandle?: string }).sourceHandle === handleId)
  );
  
  for (const edge of outgoingEdges) {
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!targetNode || visitedNodes.has(targetNode.id)) continue;
    
    const nodeData = (targetNode as { data?: { nodeType?: string } }).data;
    
    // Stop at End node
    if (nodeData?.nodeType === 'End') continue;
    
    visitedNodes.add(targetNode.id);
    branchNodes.push(targetNode);
    
    // If this is not an If node, recursively get its children
    if (nodeData?.nodeType !== 'If') {
      const childNodes = getNodesInBranch(targetNode.id, null, nodes, edges, visitedNodes);
      branchNodes.push(...childNodes);
    }
  }
  
  return branchNodes;
};