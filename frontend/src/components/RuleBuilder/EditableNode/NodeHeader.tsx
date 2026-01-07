import React from 'react';
import { Typography } from '@mui/material';

interface NodeHeaderProps {
  isSpecialNode: boolean;
  label: string;
  displayName?: string;
  nodeType: string;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  isSpecialNode,
  label,
  displayName,
  nodeType,
}) => {
  if (isSpecialNode) {
    return (
      <Typography
        sx={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'text.primary',
          textAlign: 'center',
          padding: '12px 16px',
        }}
      >
        {label || displayName || 'Node'}
      </Typography>
    );
  }

  return (
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
        {displayName || nodeType}
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
        {label || displayName || 'Node'}
      </Typography>
    </>
  );
};
