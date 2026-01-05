import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CardContent,
  Tooltip,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import type { Node } from '@xyflow/react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CodeIcon from '@mui/icons-material/Code';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon2 from '@mui/icons-material/ChevronRight';
import StorageIcon from '@mui/icons-material/Storage';
import { SidebarContainer, NodeCard, ScrollableList, ToggleButton } from './styles';
import { predefinedFunctions } from '../../../utils/Templates/customFuncTemplate';
import { globalVariables } from '../../../utils/Flow/GlobalVariables';

interface NodeTemplate {
  type: string;
  label: string;
  description: string;
  color: string;
  isFunction?: boolean;
}

interface VariableTreeNode {
  key: string;
  path: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  isDraggable: boolean;
  children?: VariableTreeNode[];
}

interface LeftSidebarProps {
  mode?: 'main' | 'modal';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  hideCustomFunctions?: boolean;
  showGlobalVariables?: boolean;
  allNodes?: Node[];
}

// Helper function to get type of value
const getValueType = (value: unknown): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as 'object' | 'string' | 'number' | 'boolean';
};

// Helper function to build tree structure
const buildVariableTree = (obj: unknown, parentPath: string = ''): VariableTreeNode[] => {
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }

  const result: VariableTreeNode[] = [];
  const entries = Object.entries(obj);

  entries.forEach(([key, value]) => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const valueType = getValueType(value);
    const isDraggable = valueType !== 'object' && valueType !== 'array';

    const node: VariableTreeNode = {
      key,
      path: currentPath,
      value,
      type: valueType,
      isDraggable,
    };

    // Recursively build children for objects and arrays
    if (valueType === 'object') {
      node.children = buildVariableTree(value, currentPath);
    } else if (valueType === 'array' && Array.isArray(value)) {
      node.children = value.map((item, index) => {
        const arrayPath = `${currentPath}[${index}]`;
        const itemType = getValueType(item);
        const itemNode: VariableTreeNode = {
          key: `[${index}]`,
          path: arrayPath,
          value: item,
          type: itemType,
          isDraggable: itemType !== 'object' && itemType !== 'array',
        };

        if (itemType === 'object') {
          itemNode.children = buildVariableTree(item, arrayPath);
        }

        return itemNode;
      });
    }

    result.push(node);
  });

  return result;
};

// Tree Item Component
const VariableTreeItem: React.FC<{
  node: VariableTreeNode;
  level: number;
}> = ({ node, level }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const hasChildren = node.children && node.children.length > 0;

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'object': return '#8b5cf6';
      case 'array': return '#ec4899';
      case 'string': return '#10b981';
      case 'number': return '#3b82f6';
      case 'boolean': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string): string => {
    return `(${type})`;
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (node.isDraggable) {
      event.stopPropagation();
      
      // All variables are wrapped with {{ }} syntax
      event.dataTransfer.setData('variablePath', `{{ ${node.path} }}`);
      event.dataTransfer.setData('variableValue', JSON.stringify(node.value));
      event.dataTransfer.effectAllowed = 'copy';
    }
  };

  return (
    <>
      <Box
        sx={{
          pl: level * 3,
          py: 0.75,
          pr: 2,
          display: 'inline-flex',
          minWidth: '100%',
          width: 'fit-content',
          alignItems: 'center',
          gap: 0.75,
          cursor: node.isDraggable ? 'grab' : hasChildren ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: node.isDraggable ? 'action.hover' : hasChildren ? 'action.selected' : 'transparent',
          },
          '&:active': {
            cursor: node.isDraggable ? 'grabbing' : hasChildren ? 'pointer' : 'default',
          },
        }}
        draggable={node.isDraggable}
        onDragStart={handleDragStart}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Expand/Collapse Icon - Fixed width for alignment */}
        <Box sx={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hasChildren ? (
            <IconButton
              size="small"
              sx={{ p: 0, width: 20, height: 20 }}
            >
              {expanded ? (
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              ) : (
                <ChevronRightIcon2 sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          ) : null}
        </Box>

        {/* Drag Icon for draggable items - Fixed width for alignment */}
        <Box sx={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {node.isDraggable && (
            <DragIndicatorIcon sx={{ fontSize: 14, color: 'primary.main' }} />
          )}
        </Box>

        {/* Key Name */}
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.813rem',
            fontWeight: hasChildren ? 600 : 400,
            color: hasChildren ? 'primary.main' : 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {node.key}
        </Typography>

        {/* Type Label */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.688rem',
            color: getTypeColor(node.type),
            opacity: 0.8,
            whiteSpace: 'nowrap',
          }}
        >
          {getTypeLabel(node.type)}
        </Typography>

        {/* Value for primitive types */}
        {node.isDraggable && node.type !== 'null' && (
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.688rem',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {node.type === 'string' ? `"${node.value}"` : String(node.value)}
          </Typography>
        )}
      </Box>

      {/* Children */}
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {node.children!.map((child, index) => (
            <VariableTreeItem
              key={`${child.path}-${index}`}
              node={child}
              level={level + 1}
            />
          ))}
        </Collapse>
      )}
    </>
  );
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  mode = 'main',
  collapsed = false,
  onToggleCollapse,
  hideCustomFunctions = false,
  showGlobalVariables = false,
  allNodes = [],
}) => {
  // Extract local variables from nodes
  const extractLocalVariables = (): Record<string, unknown> => {
    const localVars: Record<string, unknown> = {};
    
    allNodes.forEach((node) => {
      const nodeData = node.data as { nodeType?: string; params?: Record<string, string> };
      const params = nodeData?.params || {};
      
      // SetVariable nodes
      if (nodeData?.nodeType === 'SetVariable') {
        const varName = params.name || params.variableName;
        const varValue = params.value || params.variableValue || '';
        if (varName) {
          localVars[varName] = varValue;
        }
      }
      
      // FetchDB nodes
      if (nodeData?.nodeType === 'FetchDB') {
        const resultVar = params.resultVar || params.variable;
        if (resultVar) {
          localVars[resultVar] = '{ }'; // Placeholder for DB result
        }
      }
      
      // Custom Function nodes
      if (nodeData?.nodeType === 'CustomFunction') {
        const resultVar = params.resultVar;
        if (resultVar) {
          localVars[resultVar] = '{ }'; // Placeholder for function result
        }
      }
    });
    
    return localVars;
  };
  
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

  // Build variable trees
  const ruleRequestTree: VariableTreeNode[] = buildVariableTree(globalVariables.RuleRequest, 'RuleRequest');
  const ruleConfigTree: VariableTreeNode[] = buildVariableTree(globalVariables.RuleConfig, 'RuleConfig');
  const localVars = extractLocalVariables();
  const localVarsTree: VariableTreeNode[] = buildVariableTree(localVars, '');

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
    // If showing global variables, return empty as we'll render tree separately
    if (showGlobalVariables && activeTab === 1) {
      return [];
    }

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

      {!hideCustomFunctions && !showGlobalVariables && (
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

      {showGlobalVariables && (
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
          <Tab label="Variables" />
        </Tabs>
      )}

      {hideCustomFunctions && !showGlobalVariables && mode === 'main' && (
        <Box sx={{ p: 1.5, bgcolor: 'info.lighter', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="info.main" fontWeight={500}>
            Basic Nodes Only (Nested Canvas Mode)
          </Typography>
        </Box>
      )}

      {/* Scrollable Node List */}
      <ScrollableList>
        {/* Show regular node cards for basic nodes and custom functions */}
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

        {/* Show tree structure for variables */}
        {showGlobalVariables && activeTab === 1 && (
          <Box sx={{ p: 1.5, overflowX: 'auto', minWidth: 0 }}>
            <Box sx={{ minWidth: 300 }}>
              {/* Local Variables Section */}
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                color="secondary.main" 
                sx={{ mb: 1.5, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}
              >
                <StorageIcon sx={{ fontSize: 18 }} />
                Local Variables
              </Typography>
              {localVarsTree.length > 0 ? (
                localVarsTree.map((node, index) => (
                  <VariableTreeItem key={`lv-${node.path}-${index}`} node={node} level={0} />
                ))
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, display: 'block', mb: 2 }}>
                  No local variables defined yet. Use SetVariable or FetchDB nodes to create variables.
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Global Variables Section */}
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                color="primary.main" 
                sx={{ mb: 1.5, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                Global Variables (RuleRequest)
              </Typography>
              {ruleRequestTree.map((node, index) => (
                <VariableTreeItem key={`rr-${node.path}-${index}`} node={node} level={0} />
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                color="primary.main" 
                sx={{ mb: 1.5, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}
              >
                <CodeIcon sx={{ fontSize: 18 }} />
                Global Variables (RuleConfig)
              </Typography>
              {ruleConfigTree.map((node, index) => (
                <VariableTreeItem key={`rc-${node.path}-${index}`} node={node} level={0} />
              ))}
            </Box>
          </Box>
        )}

        {/* Empty states */}
        {activeTab === 1 && functionNodes.length === 0 && !showGlobalVariables && (
          <Box textAlign="center" py={6} color="text.secondary">
            <CodeIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
            <Typography variant="body2">No functions available</Typography>
            <Typography variant="caption" display="block" mt={0.5}>
              Add functions to nodeTemplates.js
            </Typography>
          </Box>
        )}

        {showGlobalVariables && activeTab === 1 && ruleRequestTree.length === 0 && ruleConfigTree.length === 0 && (
          <Box textAlign="center" py={6} color="text.secondary">
            <InfoOutlinedIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
            <Typography variant="body2">No global variables available</Typography>
            <Typography variant="caption" display="block" mt={0.5}>
              Add variables to GlobalVariables.ts
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
