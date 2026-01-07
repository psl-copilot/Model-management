import { useMemo } from 'react';
import { predefinedFunctions } from '../../utils/Templates/customFuncTemplate';

export interface NodeTemplate {
  type: string;
  label: string;
  description: string;
  color: string;
  isFunction?: boolean;
}

interface UseNodePaletteProps {
  mode?: 'main' | 'modal';
  hideCustomFunctions?: boolean;
}

export const useNodePalette = ({ mode = 'main', hideCustomFunctions = false }: UseNodePaletteProps) => {
  const basicNodes: NodeTemplate[] = useMemo(
    () => [
      { type: 'Import', label: 'Import', description: 'Import modules', color: '#8b5cf6' },
      { type: 'SetVariable', label: 'Set Variable', description: 'Assign value to variable', color: '#60a5fa' },
      { type: 'Log', label: 'Print Log', description: 'Output to console', color: '#fbbf24' },
      { type: 'If', label: 'If Condition', description: 'Conditional branch', color: '#ec4899' },
      { type: 'Code', label: 'Custom Code', description: 'Execute custom code', color: '#a78bfa' },
      { type: 'FetchDB', label: 'Fetch from DB', description: 'Database query', color: '#fb923c' },
      { type: 'ThrowError', label: 'Throw Error', description: 'Raise an error', color: '#f87171' },
    ],
    []
  );

  const modalNodes: NodeTemplate[] = useMemo(
    () => basicNodes.filter((n) => n.type !== 'Import'),
    [basicNodes]
  );

  const functionNodes: NodeTemplate[] = useMemo(
    () =>
      Object.entries(predefinedFunctions)
        .filter(([key]) => key !== 'HandleTransaction')
        .map(([key, func]) => ({
          type: key,
          label: func.displayName,
          description: func.description,
          isFunction: true,
          color: '#14b8a6', // Teal color for all functions
        })),
    []
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
