import { useMemo } from 'react';

export interface NodeTemplate {
  type?: string;
  label?: string;
  description?: string;
  color?: string;
  displayName?: string;
  isFunction?: boolean;
  bgColor?: string;
  inputs?: Array<{
    key: string;
    label: string;
    defaultValue?: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  handles?: {
    source: boolean;
    target: boolean;
  };
}

interface UseNodePaletteProps {
  mode?: 'main' | 'modal';
  hideCustomFunctions?: boolean;
  apiNodes?: NodeTemplate[];
}

export const useNodePalette = ({ 
  mode = 'main', 
  hideCustomFunctions = false,
  apiNodes = [],
}: UseNodePaletteProps) => {
  // Use API nodes if available, otherwise fall back to predefined nodes
  const basicNodes: NodeTemplate[] = useMemo(
    () => {
      if (apiNodes && apiNodes.length > 0) {
        return apiNodes.filter((node) => !node.isFunction);
      }
      return [
        { type: 'Import', label: 'Import', description: 'Import modules', color: '#8b5cf6' },
        { type: 'SetVariable', label: 'Set Variable', description: 'Assign value to variable', color: '#60a5fa' },
        { type: 'Log', label: 'Print Log', description: 'Output to console', color: '#fbbf24' },
        { type: 'If', label: 'If Condition', description: 'Conditional branch', color: '#ec4899' },
        { type: 'Code', label: 'Custom Code', description: 'Execute custom code', color: '#a78bfa' },
        { type: 'FetchDB', label: 'Fetch from DB', description: 'Database query', color: '#fb923c' },
        { type: 'ThrowError', label: 'Throw Error', description: 'Raise an error', color: '#f87171' },
      ];
    },
    [apiNodes]
  );

  const modalNodes: NodeTemplate[] = useMemo(
    () => basicNodes.filter((n) => n.type !== 'Import' && n.type !== 'Start' && n.type !== 'End'),
    [basicNodes]
  );

  const functionNodes: NodeTemplate[] = useMemo(
    () => {
      if (apiNodes && apiNodes.length > 0) {
        return apiNodes.filter((node) => node.isFunction);
      }
      return [];
    },
    [apiNodes]
  );

  const getNodesToShow = (activeTab: number): NodeTemplate[] => {
    if (hideCustomFunctions) {
      return mode === 'modal' ? modalNodes : basicNodes;
    }

    const isBasicTab = activeTab === 0;
    if (mode === 'modal') {
      return isBasicTab ? modalNodes : functionNodes;
    }

    return isBasicTab ? basicNodes : functionNodes;
  };

  return {
    basicNodes,
    modalNodes,
    functionNodes,
    getNodesToShow,
  };
};
