import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Node } from '@xyflow/react';
import {
  SidebarContainer,
  CloseButton,
  SectionContainer,
  SectionTitle,
  PropertyRow,
  EmptyState,
} from './styles';
import { getNodeTemplate, type FunctionNodeTemplate } from '../../../utils/Templates/customFuncTemplate';
import { validateVariableName, extractVariablesFromNodes } from '../../../utils/Flow/VariableManager';

interface RightSidebarProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Record<string, unknown>) => void;
  allNodes?: Node[]; // For variable validation
  viewOnly?: boolean;
}

interface NodeData {
  label?: string;
  nodeType?: string;
  params?: Record<string, string>;
  [key: string]: unknown;
}

interface IfCondition {
  type: 'if' | 'elseif' | 'else';
  condition?: string;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
  allNodes = [],
  viewOnly = false,
}) => {
  const collapsed = !selectedNode;
  
  // Derive values directly from selectedNode
  const nodeData = selectedNode?.data as NodeData | undefined;
  const template = nodeData?.nodeType ? getNodeTemplate(nodeData.nodeType) || null : null;
  
  // Local state only for input field controlled values (during typing)
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingParams, setEditingParams] = useState<Record<string, string> | null>(null);
  const [variableError, setVariableError] = useState<string | null>(null);
  
  // Get current values (use editing values if available, otherwise node data)
  const currentLabel = editingLabel !== null ? editingLabel : (nodeData?.label || '');
  const currentParams = editingParams !== null ? editingParams : (nodeData?.params || {});

  // Compute initial validation for SetVariable nodes
  const computedVariableError = React.useMemo(() => {
    if (nodeData?.nodeType === 'SetVariable' && selectedNode) {
      const varName = currentParams.name || currentParams.variableName;
      
      if (varName && varName.trim()) {
        const existingVars = extractVariablesFromNodes(allNodes);
        const validation = validateVariableName(
          varName,
          selectedNode.id,
          existingVars
        );
        
        return validation.isValid ? null : validation.error || null;
      }
    }
    return null;
  }, [nodeData?.nodeType, selectedNode, currentParams.name, currentParams.variableName, allNodes]);

  // Use computed error if no manual error is set
  const displayError = variableError !== null ? variableError : computedVariableError;

  // Parse conditions for If nodes
  const getConditions = (): IfCondition[] => {
    if (nodeData?.nodeType !== 'If') return [];
    try {
      const conditionsStr = currentParams['conditions'];
      return conditionsStr ? JSON.parse(conditionsStr) : [{ type: 'if', condition: 'x > 5' }];
    } catch {
      return [{ type: 'if', condition: 'x > 5' }];
    }
  };

  const updateConditions = (newConditions: IfCondition[]) => {
    const updatedParams = { ...currentParams, conditions: JSON.stringify(newConditions) };
    setEditingParams(updatedParams);
    
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { params: updatedParams });
    }
  };

  const handleAddElseIf = () => {
    const conditions = getConditions();
    const hasElse = conditions.some(c => c.type === 'else');
    
    if (hasElse) {
      // Insert before else
      const elseIndex = conditions.findIndex(c => c.type === 'else');
      conditions.splice(elseIndex, 0, { type: 'elseif', condition: 'y > 10' });
    } else {
      conditions.push({ type: 'elseif', condition: 'y > 10' });
    }
    
    updateConditions(conditions);
  };

  const handleAddElse = () => {
    const conditions = getConditions();
    const hasElse = conditions.some(c => c.type === 'else');
    
    if (!hasElse) {
      conditions.push({ type: 'else' });
      updateConditions(conditions);
    }
  };

  const handleRemoveCondition = (index: number) => {
    const conditions = getConditions();
    if (conditions.length > 1) { // Keep at least one if condition
      conditions.splice(index, 1);
      updateConditions(conditions);
    }
  };

  const handleConditionChange = (index: number, newCondition: string) => {
    const conditions = getConditions();
    conditions[index].condition = newCondition;
    updateConditions(conditions);
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = event.target.value;
    setEditingLabel(newLabel);
    
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { label: newLabel });
    }
  };

  const handleParamChange = (paramKey: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    const updatedParams = { ...currentParams, [paramKey]: newValue };
    
    // Special validation for SetVariable node's variable name
    if (nodeData?.nodeType === 'SetVariable' && (paramKey === 'name' || paramKey === 'variableName')) {
      const existingVars = extractVariablesFromNodes(allNodes);
      const validation = validateVariableName(
        newValue,
        selectedNode?.id || '',
        existingVars
      );
      
      if (!validation.isValid) {
        setVariableError(validation.error || null);
        // Still update the params to show the invalid value, but mark as error
      } else {
        setVariableError(null);
      }
    } else {
      // Clear error for non-variable fields
      setVariableError(null);
    }
    
    setEditingParams(updatedParams);
    
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { params: updatedParams });
    }
  };

  const handleLabelBlur = () => {
    // Reset editing state on blur to sync with actual node data
    setEditingLabel(null);
  };

  if (collapsed) {
    return <SidebarContainer collapsed={true} />;
  }

  if (!selectedNode || !template) {
    return (
      <SidebarContainer collapsed={false}>
        <EmptyState>
          <InfoOutlinedIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body2">
            Select a node to view and edit its properties
          </Typography>
        </EmptyState>
      </SidebarContainer>
    );
  }

  // At this point we know selectedNode and template are not null
  const isFunctionNode = 'description' in template;
  const isReadOnly = nodeData?.nodeType === 'Start' || nodeData?.nodeType === 'End';

  return (
    <SidebarContainer collapsed={false}>
      <CloseButton size="small" onClick={onClose} aria-label="Close properties panel">
        <CloseIcon fontSize="small" />
      </CloseButton>

      {/* Header Section */}
      <SectionContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Node Properties
          </Typography>
        </Box>
        <Chip
          label={template.displayName}
          size="small"
          color="primary"
          variant="outlined"
        />
      </SectionContainer>

      <Divider />

      {/* Node Information */}
      {isFunctionNode && (template as FunctionNodeTemplate).description && (
        <>
          <SectionContainer>
            <SectionTitle>Description</SectionTitle>
            <Typography variant="body2" color="text.secondary">
              {(template as FunctionNodeTemplate).description}
            </Typography>
          </SectionContainer>
          <Divider />
        </>
      )}

      {/* Basic Properties */}
      <SectionContainer>
        <SectionTitle>Basic Properties</SectionTitle>
        
        <PropertyRow>
          <TextField
            fullWidth
            label="Node ID"
            value={selectedNode.id}
            size="small"
            disabled
            variant="outlined"
            helperText="Unique identifier (read-only)"
          />
        </PropertyRow>

        <PropertyRow>
          <TextField
            fullWidth
            label="Label"
            value={currentLabel}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            size="small"
            variant="outlined"
            placeholder={template?.displayName}
            helperText={isReadOnly ? "Start/End nodes cannot be renamed" : viewOnly ? "View only mode" : "Display name for this node"}
            disabled={isReadOnly || viewOnly}
          />
        </PropertyRow>
      </SectionContainer>

      {/* Parameters Section */}
      {template.inputs && template.inputs.length > 0 && (
        <>
          <Divider />
          <SectionContainer>
            <SectionTitle>Parameters</SectionTitle>
            
            {/* Special handling for If node */}
            {nodeData?.nodeType === 'If' ? (
              <Box>
                {getConditions().map((cond, index) => (
                  <PropertyRow key={index}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', width: '100%' }}>
                      <TextField
                        fullWidth
                        label={cond.type === 'else' ? 'Else (no condition)' : `${cond.type === 'if' ? 'If' : 'Else If'} Condition`}
                        value={cond.condition || ''}
                        onChange={(e) => handleConditionChange(index, e.target.value)}
                        size="small"
                        variant="outlined"
                        disabled={cond.type === 'else' || viewOnly}
                        helperText={cond.type === 'else' ? 'Default fallback path' : viewOnly ? 'View only mode' : `Enter boolean expression (e.g., x > 5)`}
                      />
                      {index > 0 && !viewOnly && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveCondition(index)}
                          sx={{ mt: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </PropertyRow>
                ))}
                
                {!viewOnly && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddElseIf}
                      fullWidth
                    >
                      Add Else If
                    </Button>
                    {!getConditions().some(c => c.type === 'else') && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddElse}
                        fullWidth
                      >
                        Add Else
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              /* Regular parameters for other nodes */
              template.inputs.map((input) => {
                const currentValue = currentParams[input.key] ?? input.defaultValue;
                
                // Determine if this should be a multiline input
                const isMultiline = input.key === 'code' || 
                                    input.key === 'query' || 
                                    input.key === 'importStatement' ||
                                    currentValue.length > 50;
                
                // Check if this is the variable name field for SetVariable node
                const isVariableNameField = nodeData?.nodeType === 'SetVariable' && 
                                           (input.key === 'name' || input.key === 'variableName');
                const hasError = isVariableNameField && !!displayError;
                
                return (
                  <PropertyRow key={input.key}>
                    <TextField
                      fullWidth
                      label={input.label}
                      value={currentValue}
                      onChange={handleParamChange(input.key)}
                      size="small"
                      variant="outlined"
                      multiline={isMultiline}
                      rows={isMultiline ? 3 : 1}
                      error={hasError}
                      helperText={
                        hasError 
                          ? displayError 
                          : isReadOnly 
                            ? "Start/End nodes cannot be edited" 
                            : viewOnly
                              ? "View only mode"
                              : `Default: ${input.defaultValue}`
                      }
                      disabled={isReadOnly || viewOnly}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontFamily: isMultiline ? 'monospace' : 'inherit',
                          fontSize: isMultiline ? '0.875rem' : 'inherit',
                        },
                      }}
                    />
                  </PropertyRow>
                );
              })
            )}
          </SectionContainer>
        </>
      )}

      {/* Connection Info */}
      <Divider />
      <SectionContainer>
        <SectionTitle>Connections</SectionTitle>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {template.handles.target && (
            <Chip
              label="Has Input"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {template.handles.source && (
            <Chip
              label="Has Output"
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>
      </SectionContainer>

      {/* Function-specific Info */}
      {isFunctionNode && (
        <>
          <Divider />
          <SectionContainer>
            <SectionTitle>Function Properties</SectionTitle>
            <PropertyRow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Extensible:
                </Typography>
                <Chip
                  label={(template as FunctionNodeTemplate).isExtensible ? 'Yes' : 'No'}
                  size="small"
                  color={(template as FunctionNodeTemplate).isExtensible ? 'primary' : 'default'}
                  variant="outlined"
                />
              </Box>
            </PropertyRow>
          </SectionContainer>
        </>
      )}

      {/* Position Info (for debugging/advanced users) */}
      <Divider />
      <SectionContainer sx={{ backgroundColor: 'grey.50' }}>
        <SectionTitle>Advanced</SectionTitle>
        
        <PropertyRow>
          <Typography variant="caption" color="text.secondary">
            Position: X: {Math.round(selectedNode.position.x)}, Y: {Math.round(selectedNode.position.y)}
          </Typography>
        </PropertyRow>
        
        <PropertyRow>
          <Typography variant="caption" color="text.secondary">
            Type: {nodeData?.nodeType}
          </Typography>
        </PropertyRow>
      </SectionContainer>
    </SidebarContainer>
  );
};

export default RightSidebar;
