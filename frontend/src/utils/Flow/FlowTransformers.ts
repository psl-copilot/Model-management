import type { Node, Edge } from '@xyflow/react';

export interface ApiNode {
  id: string;
  type: string;
  label: string;
  params?: Record<string, unknown>;
  position?: { x: number; y: number };
  nestedFlow?: { nodes: ApiNode[]; edges: ApiEdge[] };
}

export interface ApiEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export interface TransformedFlowData {
  nodes: Node[];
  edges: Edge[];
  nestedFlows: Record<string, { nodes: Node[]; edges: Edge[] }>;
}

export const transformApiNodeToCanvasNode = (node: ApiNode): Node => ({
  id: node.id,
  type: 'editableNode',
  position: node.position || { x: 0, y: 0 },
  data: {
    label: node.label,
    nodeType: node.type,
    params: node.params || {},
  },
});

export const transformApiEdgeToCanvasEdge = (edge: ApiEdge): Edge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  type: edge.type || 'smoothstep',
  animated: edge.animated || false,
});

export const transformApiFlowData = (
  apiNodes: ApiNode[],
  apiEdges: ApiEdge[]
): TransformedFlowData => {
  const nodes = apiNodes.map(transformApiNodeToCanvasNode);
  const edges = apiEdges.map(transformApiEdgeToCanvasEdge);
  const nestedFlows: Record<string, { nodes: Node[]; edges: Edge[] }> = {};

  apiNodes.forEach((node) => {
    if (node.nestedFlow) {
      nestedFlows[node.id] = {
        nodes: node.nestedFlow.nodes.map(transformApiNodeToCanvasNode),
        edges: node.nestedFlow.edges.map(transformApiEdgeToCanvasEdge),
      };
    }
  });

  return { nodes, edges, nestedFlows };
};
