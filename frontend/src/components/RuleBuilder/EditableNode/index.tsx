import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getNodeTemplate } from '../../../utils/Templates/customFuncTemplate';

export interface EditableNodeData extends Record<string, unknown> {
  label: string;
  onChange?: (value: string) => void;
  onParamChange?: (paramKey: string, value: string) => void;
  nodeType: string;
  params?: Record<string, string>;
}

const NodeContainer = styled(Box)<{ nodeType: string; selected: boolean }>(({ theme, nodeType, selected }) => {
  const template = getNodeTemplate(nodeType);
  const bgColor = template?.bgColor || '#e3f2fd';
  
  // Parse Tailwind-like class names to Material UI colors
  let backgroundColor = '#e3f2fd';
  let borderColor = '#2196f3';
  
  if (bgColor.includes('green')) {
    backgroundColor = '#e8f5e9';
    borderColor = '#4caf50';
  } else if (bgColor.includes('blue')) {
    backgroundColor = '#e3f2fd';
    borderColor = '#2196f3';
  } else if (bgColor.includes('yellow')) {
    backgroundColor = '#fff9c4';
    borderColor = '#ffeb3b';
  } else if (bgColor.includes('purple')) {
    backgroundColor = '#f3e5f5';
    borderColor = '#9c27b0';
  } else if (bgColor.includes('red')) {
    backgroundColor = '#ffebee';
    borderColor = '#f44336';
  } else if (bgColor.includes('orange')) {
    backgroundColor = '#fff3e0';
    borderColor = '#ff9800';
  } else if (bgColor.includes('pink')) {
    backgroundColor = '#fce4ec';
    borderColor = '#e91e63';
  } else if (bgColor.includes('gray')) {
    backgroundColor = '#f5f5f5';
    borderColor = '#9e9e9e';
  }
  
  return {
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
  };
});

const EditableNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as EditableNodeData;
  const [expanded, setExpanded] = useState(false);
  
  // Use data directly from props for real-time updates
  const label = nodeData.label;
  const localParams = nodeData.params || {};

  const template = getNodeTemplate(nodeData.nodeType);
  
  // Check if this is a special node (Start, End, HandleTransaction)
  const isSpecialNode = nodeData.nodeType === 'Start' || 
                        nodeData.nodeType === 'End' || 
                        nodeData.nodeType === 'HandleTransaction';

  // Get conditions for If nodes
  const getIfConditions = () => {
    if (nodeData.nodeType !== 'If') return [];
    try {
      const conditionsStr = localParams['conditions'];
      return conditionsStr ? JSON.parse(conditionsStr) : [{ type: 'if', condition: 'x > 5' }];
    } catch {
      return [{ type: 'if', condition: 'x > 5' }];
    }
  };

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <NodeContainer nodeType={nodeData.nodeType} selected={!!selected}>
      {template?.handles.target && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: '#555',
            width: '10px',
            height: '10px',
            border: '2px solid white',
          }}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {isSpecialNode ? (
          // Simple centered layout for Start, End, and HandleTransaction nodes
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'text.primary',
              textAlign: 'center',
              padding: '12px 16px',
            }}
          >
            {label || template?.displayName || 'Node'}
          </Typography>
        ) : (
          // Regular layout for other nodes
          <>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
              }}
            >
              {template?.displayName || nodeData.nodeType}
            </Typography>

            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.primary',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {label || template?.displayName || 'Node'}
            </Typography>

            {template && template.inputs.length > 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    Parameters
                  </Typography>
                  <IconButton size="small" onClick={toggleExpanded}>
                    {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Box>

                <Collapse in={expanded}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                    {template.inputs.map((input) => {
                      const value = localParams[input.key] || input.defaultValue;
                      return (
                        <Box
                          key={input.key}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              color: 'text.secondary',
                              display: 'block',
                              marginBottom: '2px',
                            }}
                          >
                            {input.label}:
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: 'text.primary',
                              fontFamily: value.length > 20 ? 'monospace' : 'inherit',
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </>
            )}
          </>
        )}
      </Box>

      {template?.handles.source && nodeData.nodeType === 'If' ? (
        <>
          {/* Right-side handles for if/else if/else branches */}
          {getIfConditions().map((cond: { type: string; condition?: string }, index: number) => {
            const handleId = cond.type === 'else' ? 'else' : cond.type === 'if' ? 'if' : `elseif-${index}`;
            const totalConditions = getIfConditions().length;
            
            // Distribute handles evenly on right side
            const spacing = 80 / (totalConditions + 1);
            const topPosition = 10 + spacing * (index + 1);
            
            return (
              <Handle
                key={handleId}
                id={handleId}
                type="source"
                position={Position.Right}
                style={{
                  background: '#4caf50',
                  width: '10px',
                  height: '10px',
                  border: '2px solid white',
                  top: `${topPosition}%`,
                }}
              />
            );
          })}
          
          {/* Bottom handle for continuation after if block */}
          <Handle
            id="exit"
            type="source"
            position={Position.Bottom}
            style={{
              background: '#000000',
              width: '10px',
              height: '10px',
              border: '2px solid white',
            }}
          />
        </>
      ) : template?.handles.source ? (
        // Single output handle for other nodes
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: '#555',
            width: '10px',
            height: '10px',
            border: '2px solid white',
          }}
        />
      ) : null}
    </NodeContainer>
  );
};

export default memo(EditableNode);
