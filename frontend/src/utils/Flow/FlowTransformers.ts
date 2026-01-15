import type { Node, Edge } from '@xyflow/react';
import { getLabelForHandle, getColorForHandle } from '../Common/helpers';

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
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  style?: Record<string, unknown>;
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

export const transformApiEdgeToCanvasEdge = (edge: ApiEdge): Edge => {
  // Reconstruct label and style from sourceHandle if not provided
  const hasSourceHandle = edge.sourceHandle && edge.sourceHandle !== null;
  const needsReconstruction = hasSourceHandle && (!edge.label || !edge.style);
  
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
    label: edge.label || (needsReconstruction ? getLabelForHandle(edge.sourceHandle!) : undefined),
    style: edge.style || (needsReconstruction ? {
      stroke: getColorForHandle(edge.sourceHandle!),
      strokeWidth: 2,
    } : undefined),
    type: edge.type || 'smoothstep',
    animated: edge.animated || false,
  };
};

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
