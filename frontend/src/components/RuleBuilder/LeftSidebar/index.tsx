import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CardContent,
  Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CodeIcon from '@mui/icons-material/Code';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SidebarContainer, NodeCard, ScrollableList, ToggleButton } from './styles';
import { predefinedFunctions } from '../../../utils/Templates/customFuncTemplate';

interface NodeTemplate {
  type: string;
  label: string;
  description: string;
  color: string;
  isFunction?: boolean;
}

interface LeftSidebarProps {
  mode?: 'main' | 'modal';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  hideCustomFunctions?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  mode = 'main',
  collapsed = false,
  onToggleCollapse,
  hideCustomFunctions = false,
}) => {
  // Data Structure - Exclude Start, End as they're added by default to canvas
  const basicNodes: NodeTemplate[] = [
    { type: 'Import', label: 'Import', description: 'Import modules', color: '#8b5cf6' },
    { type: 'SetVariable', label: 'Set Variable', description: 'Assign value to variable', color: '#60a5fa' },
    { type: 'Log', label: 'Print Log', description: 'Output to console', color: '#fbbf24' },
    { type: 'If', label: 'If Condition', description: 'Conditional branch', color: '#ec4899' },
    { type: 'Code', label: 'Custom Code', description: 'Execute custom code', color: '#a78bfa' },
    { type: 'FetchDB', label: 'Fetch from DB', description: 'Database query', color: '#fb923c' },
    { type: 'ThrowError', label: 'Throw Error', description: 'Raise an error', color: '#f87171' }
  ];

  // For modal mode, filter out Import
  const modalNodes: NodeTemplate[] = basicNodes.filter(
    (n) => n.type !== 'Import'
  );

  // Function nodes - populated from predefinedFunctions, exclude HandleTransaction as it's added by default
  const functionNodes: NodeTemplate[] = Object.entries(predefinedFunctions)
    .filter(([key]) => key !== 'HandleTransaction')
    .map(([key, func]) => ({
      type: key,
      label: func.displayName,
      description: func.description,
      isFunction: true,
      color: '#14b8a6', // Teal color for all functions
    }));

  // State
  const [activeTab, setActiveTab] = useState<number>(0);

  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string): void => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Logic
  const getNodesToShow = (): NodeTemplate[] => {
    // If custom functions are hidden, always show basic nodes
    if (hideCustomFunctions) {
      return mode === 'modal' ? modalNodes : basicNodes;
    }

    const isBasicTab = activeTab === 0;

    if (mode === 'modal') {
      return isBasicTab ? modalNodes : functionNodes;
    }
    return isBasicTab ? basicNodes : functionNodes;
  };

  const nodesToShow = getNodesToShow();

  return (
    <Box sx={{ position: 'relative' }}>
      <SidebarContainer mode={mode} collapsed={collapsed} activeTab={activeTab}>
        {!collapsed && (
          <>
            {mode === 'main' && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            Node Palette
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Drag nodes to the canvas
          </Typography>
        </Box>
      )}

      {mode === 'modal' && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h6" component="h2" fontWeight={600} textAlign="center">
            Add Nodes
          </Typography>
        </Box>
      )}

      {!hideCustomFunctions && (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
            width: '100%',
            minWidth: 0,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minWidth: 0,
              padding: '12px 8px',
            },
          }}
        >
          <Tab label="Basic Nodes" />
          <Tab label="Functions" />
        </Tabs>
      )}

      {hideCustomFunctions && mode === 'main' && (
        <Box sx={{ p: 1.5, bgcolor: 'info.lighter', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="info.main" fontWeight={500}>
            Basic Nodes Only (Nested Canvas Mode)
          </Typography>
        </Box>
      )}

      {/* Scrollable Node List */}
      <ScrollableList>
        {nodesToShow.map((node) => (
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

        {activeTab === 1 && functionNodes.length === 0 && (
          <Box textAlign="center" py={6} color="text.secondary">
            <CodeIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
            <Typography variant="body2">No functions available</Typography>
            <Typography variant="caption" display="block" mt={0.5}>
              Add functions to nodeTemplates.js
            </Typography>
          </Box>
        )}
      </ScrollableList>

      {/* Footer Info */}
      {mode === 'main' && (
        <Box
          sx={{
            p: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          {activeTab === 0 && (
            <Box display="flex" alignItems="center">
              <InfoOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Basic building blocks for your flow
              </Typography>
            </Box>
          )}
          {activeTab === 1 && (
            <Box display="flex" alignItems="center">
              <CodeIcon sx={{ fontSize: 16, color: 'teal.500', mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Reusable functions with custom logic
              </Typography>
            </Box>
          )}
        </Box>
      )}
          </>
        )}
      </SidebarContainer>
      {mode === 'main' && onToggleCollapse && (
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <ToggleButton onClick={onToggleCollapse} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </ToggleButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default LeftSidebar;
