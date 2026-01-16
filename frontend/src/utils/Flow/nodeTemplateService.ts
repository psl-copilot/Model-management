import { mapApiNodeToTemplate } from './apiNodeMapper';
import type { NodeTemplate } from '../../hooks/RuleBuilder/useNodePalette';

interface ApiNodeInput {
  key: string;
  label: string;
  type: string;
  defaultValue?: string | boolean | number;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface ApiNode {
  id: number;
  node_json: {
    name: string;
    node_type: string;
    label: string;
    description: string | null;
    type: string;
    category: string;
    color: string;
    handles: {
      source: boolean;
      target: boolean;
    };
    inputs: ApiNodeInput[];
    code_template: string;
    default_data: Record<string, unknown>;
  };
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

let apiNodesStore: ApiNode[] = [];

export const setApiNodes = (apiNodes: unknown[]): void => {
  apiNodesStore = apiNodes as ApiNode[];
};

export const getApiNodes = (): ApiNode[] => {
  return apiNodesStore;
};


export const getNodeTemplate = (nodeType: string): NodeTemplate | undefined => {
  const apiNodes = getApiNodes();
  const apiNode = apiNodes.find((node) => {
    const nodeJson = node.node_json as { node_type?: string };
    return nodeJson.node_type === nodeType;
  });
  if (!apiNode) return undefined;
  return mapApiNodeToTemplate(apiNode);
};

export const getAllNodeTemplates = (): NodeTemplate[] => {
  const apiNodes = getApiNodes();
  return apiNodes.map((node) => mapApiNodeToTemplate(node));
};

export const getNodeTemplatesMap = (): Record<string, NodeTemplate> => {
  const apiNodes = getApiNodes();
  return apiNodes.reduce(
    (acc, node) => {
      const nodeJson = node.node_json as { node_type?: string };
      if (nodeJson.node_type) {
        acc[nodeJson.node_type] = mapApiNodeToTemplate(node);
      }
      return acc;
    },
    {} as Record<string, NodeTemplate>
  );
};
