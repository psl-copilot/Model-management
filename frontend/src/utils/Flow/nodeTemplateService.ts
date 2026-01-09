import { mockRuleBuilderNodes } from './mockRuleBuilderNodes';
import { mapApiNodeToTemplate } from './apiNodeMapper';
import type { NodeTemplate } from '../../hooks/RuleBuilder/useNodePalette';

/**
 * Gets node template by type from API data
 * Currently uses mock data, will switch to real API when backend is ready
 */
export const getNodeTemplate = (nodeType: string): NodeTemplate | undefined => {
  const apiNode = mockRuleBuilderNodes.find((node) => node.node_type === nodeType);
  if (!apiNode) return undefined;
  return mapApiNodeToTemplate(apiNode);
};

/**
 * Gets all node templates
 */
export const getAllNodeTemplates = (): NodeTemplate[] => {
  return mockRuleBuilderNodes.map(mapApiNodeToTemplate);
};

/**
 * Gets node template map by type
 */
export const getNodeTemplatesMap = (): Record<string, NodeTemplate> => {
  return mockRuleBuilderNodes.reduce(
    (acc, node) => {
      acc[node.node_type] = mapApiNodeToTemplate(node);
      return acc;
    },
    {} as Record<string, NodeTemplate>
  );
};
