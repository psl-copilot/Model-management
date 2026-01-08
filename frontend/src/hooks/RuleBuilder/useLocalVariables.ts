import { useMemo } from 'react';
import type { Node } from '@xyflow/react';

interface NodeData {
  nodeType?: string;
  params?: Record<string, string>;
  [key: string]: unknown;
}

interface UseLocalVariablesProps {
  allNodes: Node[];
}

/**
 * Extract local variables from SetVariable, FetchDB, and CustomFunction nodes
 */
export const useLocalVariables = ({ allNodes }: UseLocalVariablesProps) => {
  return useMemo(() => {
    const localVars: Record<string, unknown> = {};

    allNodes.forEach((node) => {
      const nodeData = node.data as NodeData;
      const params = nodeData?.params || {};

      // SetVariable nodes
      if (nodeData?.nodeType === 'SetVariable') {
        const varName = params.name || params.variableName;
        const varValue = params.value || params.variableValue || '';
        const dataType = params.dataType || 'any';
        
        if (varName) {
          // Handle undefined or empty value
          if (!varValue || varValue.trim() === '' || dataType === 'undefined') {
            localVars[varName] = undefined;
          } else {
            localVars[varName] = varValue;
          }
        }
      }

      // FetchDB nodes
      if (nodeData?.nodeType === 'FetchDB') {
        const resultVar = params.resultVar || params.variable;
        if (resultVar) {
          localVars[resultVar] = '{ }'; // Placeholder for DB result
        }
      }

      // Custom Function nodes
      if (nodeData?.nodeType === 'CustomFunction') {
        const resultVar = params.resultVar;
        if (resultVar) {
          localVars[resultVar] = '{ }'; // Placeholder for function result
        }
      }
    });

    return localVars;
  }, [allNodes]);
};
