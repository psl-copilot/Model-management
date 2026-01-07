import { useCallback, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { sortNodesInFlowOrder } from '../../utils/Common/helpers';
import { generateTypeScriptCode } from '../../utils/Flow/CodeGenerator';

interface NestedCanvasData {
  nodes: Node[];
  edges: Edge[];
}

interface UseCanvasCodeGenerationProps {
  nodes: Node[];
  edges: Edge[];
  nestedCanvasData: Record<string, NestedCanvasData>;
  onJsonGenerate?: (json: string) => void;
  onCodeGenerate?: (code: string) => void;
  reactFlowInstance?: Record<string, unknown>;
}

export const useCanvasCodeGeneration = ({
  nodes,
  edges,
  nestedCanvasData,
  onJsonGenerate,
  onCodeGenerate,
  reactFlowInstance,
}: UseCanvasCodeGenerationProps) => {
  // Generate JSON output
  const generateJson = useCallback(() => {
    const flowData = {
      nodes: nodes.map((node) => {
        const baseNode = {
          id: node.id,
          type: node.data.nodeType,
          label: node.data.label,
          params: node.data.params || {},
          position: node.position,
        };

        // If HandleTransaction node, include nested canvas data
        if (
          node.data.nodeType === 'HandleTransaction' &&
          nestedCanvasData[node.id]
        ) {
          const nestedData = nestedCanvasData[node.id];
          const sortedNestedNodes = sortNodesInFlowOrder(
            nestedData.nodes,
            nestedData.edges
          );

          return {
            ...baseNode,
            nestedFlow: {
              nodes: sortedNestedNodes.map((nestedNode) => ({
                id: nestedNode.id,
                type: nestedNode.data.nodeType,
                label: nestedNode.data.label,
                params: nestedNode.data.params || {},
                position: nestedNode.position,
              })),
              edges: nestedData.edges.map((nestedEdge) => ({
                id: nestedEdge.id,
                source: nestedEdge.source,
                target: nestedEdge.target,
              })),
            },
          };
        }

        return baseNode;
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    const json = JSON.stringify(flowData, null, 2);
    if (onJsonGenerate) {
      onJsonGenerate(json);
    }
  }, [nodes, edges, nestedCanvasData, onJsonGenerate]);

  // Generate TypeScript code
  const generateCode = useCallback(() => {
    const code = generateTypeScriptCode(nodes, edges, nestedCanvasData);

    if (onCodeGenerate) {
      onCodeGenerate(code);
    }
  }, [nodes, edges, nestedCanvasData, onCodeGenerate]);

  // Expose methods to parent via window object
  useEffect(() => {
    if (reactFlowInstance) {
      window.generateFlowJson = generateJson;
      window.generateFlowCode = generateCode;
    }
  }, [reactFlowInstance, generateJson, generateCode]);

  return {
    generateJson,
    generateCode,
  };
};
