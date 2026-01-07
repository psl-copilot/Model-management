import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNodeRenderer } from '../../../hooks/RuleBuilder';
import { NodeHeader } from './NodeHeader';
import { NodeParameters } from './NodeParameters';
import { NodeHandles } from './NodeHandles';

export interface EditableNodeData extends Record<string, unknown> {
  label: string;
  onChange?: (value: string) => void;
  onParamChange?: (paramKey: string, value: string) => void;
  nodeType: string;
  params?: Record<string, string>;
}

const NodeContainer = styled(Box)<{ 
  backgroundColor: string; 
  borderColor: string; 
  selected: boolean 
}>(({ theme, backgroundColor, borderColor, selected }) => ({
  minWidth: '180px',
  backgroundColor,
  border: `2px solid ${selected ? theme.palette.primary.main : borderColor}`,
  borderRadius: '8px',
  padding: theme.spacing(1.5),
  boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const EditableNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as EditableNodeData;
  
  const {
    template,
    backgroundColor,
    borderColor,
    label,
    localParams,
    isSpecialNode,
    targetHandle,
    sourceHandles,
  } = useNodeRenderer(nodeData);

  return (
    <NodeContainer 
      backgroundColor={backgroundColor} 
      borderColor={borderColor} 
      selected={!!selected}
    >
      <NodeHandles targetHandle={targetHandle} sourceHandles={sourceHandles} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <NodeHeader
          isSpecialNode={isSpecialNode}
          label={label}
          displayName={template?.displayName}
          nodeType={nodeData.nodeType}
        />

        {!isSpecialNode && template && <NodeParameters template={template} params={localParams} />}
      </Box>
    </NodeContainer>
  );
};

export default memo(EditableNode);
