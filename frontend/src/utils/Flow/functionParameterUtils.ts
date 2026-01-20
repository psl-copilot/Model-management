import type { Node } from '@xyflow/react';
import type { NodeTemplate } from '../../hooks/RuleBuilder/useNodePalette';
import { getAllNodeTemplates } from './nodeTemplateService';

export interface FunctionParameter {
  name: string;
  type: string;
  label: string;
}

export const getFunctionParameters = (
  functionName: string,
  allNodes?: Node[]
): FunctionParameter[] | null => {
  // First, try to get parameters from expanded node templates
  const templates = getAllNodeTemplates();
  const definitionTemplate = templates.find(
    (node) => 
      (node.function_name === functionName || node.nodeType === functionName || node.type === functionName) &&
      (node.mode === 'definition' || node.generation_type === 'definition')
  );

  // Check if template has parameters
  if (definitionTemplate?.parameters) {
    return definitionTemplate.parameters;
  }

  // Fallback: try to extract from definition node in canvas
  if (allNodes && allNodes.length > 0) {
    const definitionNode = allNodes.find(
      (node) =>
        node.data.function_name === functionName &&
        (node.data.mode === 'definition' || node.data.generation_type === 'definition')
    );

    if (definitionNode?.data?.params) {
      const params = definitionNode.data.params as Record<string, unknown>;
      if (params.code_template && typeof params.code_template === 'string') {
        return extractParametersFromCode(params.code_template);
      }
    }
  }

  return null;
};

export const extractParametersFromCode = (code: string): FunctionParameter[] => {
  if (!code || typeof code !== 'string') return [];

  // Match function signature: function name(...params...)
  const functionMatch = code.match(/function\s+\w+\s*\(([^)]*)\)/);
  if (!functionMatch) return [];

  const paramsString = functionMatch[1].trim();
  if (!paramsString) return [];

  // Split by comma and extract parameter names and types
  const params = paramsString.split(',').map((param) => {
    const trimmed = param.trim();
    // Match: paramName: type or just paramName
    const match = trimmed.match(/(\w+)\s*:\s*([\w[\]]+)/);
    if (match) {
      return {
        name: match[1],
        type: match[2],
        label: match[1].charAt(0).toUpperCase() + match[1].slice(1),
      };
    }
    // No type annotation
    return {
      name: trimmed,
      type: 'any',
      label: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    };
  });

  return params.filter((p) => p.name);
};

export const generateFunctionArgs = (
  parameters: FunctionParameter[],
  params: Record<string, string>
): string => {
  if (!parameters || parameters.length === 0) return '';

  const args = parameters.map((param) => {
    // Get value from params, removing {{ }} if present
    const value = params[param.name] || '';
    return value.replace(/\{\{\s*(.+?)\s*\}\}/g, '$1');
  });

  return args.join(', ');
};

export const usesDynamicParameters = (template: NodeTemplate | null | undefined): boolean => {
  return template?.useDefinitionParameters === true;
};
