import { useMemo } from 'react';
import type { EditableNodeData } from '../../components/RuleBuilder/EditableNode';
import { getNodeTemplate } from '../../utils/Templates/customFuncTemplate';
import { useNodeStyles, useNodeHandles } from './index';

export const useNodeRenderer = (nodeData: EditableNodeData) => {
  // Get node template and styling
  const template = getNodeTemplate(nodeData.nodeType);
  const { backgroundColor, borderColor } = useNodeStyles(nodeData.nodeType);
  
  // Memoize local params to prevent unnecessary re-renders
  const localParams = useMemo(() => nodeData.params || {}, [nodeData.params]);

  // Check if this is a special node (Start, End, HandleTransaction)
  const isSpecialNode = useMemo(
    () =>
      nodeData.nodeType === 'Start' ||
      nodeData.nodeType === 'End' ||
      nodeData.nodeType === 'HandleTransaction',
    [nodeData.nodeType]
  );

  // Get conditions for If nodes
  const conditions = useMemo(() => {
    if (nodeData.nodeType !== 'If') return [];
    try {
      const conditionsStr = localParams['conditions'];
      return conditionsStr ? JSON.parse(conditionsStr) : [{ type: 'if', condition: 'x > 5' }];
    } catch {
      return [{ type: 'if', condition: 'x > 5' }];
    }
  }, [nodeData.nodeType, localParams]);

  // Get handle configurations
  const { targetHandle, sourceHandles } = useNodeHandles(
    nodeData.nodeType,
    template?.handles.target || false,
    template?.handles.source || false,
    conditions
  );

  return {
    template,
    backgroundColor,
    borderColor,
    label: nodeData.label,
    localParams,
    isSpecialNode,
    conditions,
    targetHandle,
    sourceHandles,
  };
};
