import React from 'react';
import { CardContent, Box, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { NodeCard } from '../styles';
import type { NodeTemplate } from '../../../../hooks/RuleBuilder/useNodePalette';

interface NodePaletteProps {
  nodes: NodeTemplate[];
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ nodes, onDragStart }) => {
  return (
    <>
      {nodes.map((node) => (
        <NodeCard
          key={node.type}
          elevation={1}
          nodecolor={node.color}
          draggable
          onDragStart={(e) => onDragStart(e, node.type)}
        >
          <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 }, boxSizing: 'border-box' }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={0.5}>
              <Box flex={1} minWidth={0} sx={{ overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ wordBreak: 'break-word', pr: 0.5 }}>
                  {node.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    display: 'block',
                    wordBreak: 'break-word',
                    lineHeight: 1.3,
                    pr: 0.5,
                  }}
                >
                  {node.description}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mt={1}>
              <DragIndicatorIcon sx={{ fontSize: 14, color: 'text.disabled', mr: 0.5 }} />
              <Typography variant="caption" color="text.disabled">
                Drag to canvas
              </Typography>
            </Box>
          </CardContent>
        </NodeCard>
      ))}
    </>
  );
};

export default NodePalette;
