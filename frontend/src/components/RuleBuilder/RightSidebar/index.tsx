import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
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

interface RightSidebarProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Record<string, unknown>) => void;
}

interface NodeData {
  label?: string;
  nodeType?: string;
  params?: Record<string, string>;
  [key: string]: unknown;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
}) => {
  const collapsed = !selectedNode;
  
  // Derive values directly from selectedNode
  const nodeData = selectedNode?.data as NodeData | undefined;
  const template = nodeData?.nodeType ? getNodeTemplate(nodeData.nodeType) || null : null;
  
  // Local state only for input field controlled values (during typing)
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingParams, setEditingParams] = useState<Record<string, string> | null>(null);
  
  // Get current values (use editing values if available, otherwise node data)
  const currentLabel = editingLabel !== null ? editingLabel : (nodeData?.label || '');
  const currentParams = editingParams !== null ? editingParams : (nodeData?.params || {});

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
            helperText={isReadOnly ? "Start/End nodes cannot be renamed" : "Display name for this node"}
            disabled={isReadOnly}
          />
        </PropertyRow>
      </SectionContainer>

      {/* Parameters Section */}
      {template.inputs && template.inputs.length > 0 && (
        <>
          <Divider />
          <SectionContainer>
            <SectionTitle>Parameters</SectionTitle>
            
            {template.inputs.map((input) => {
              const currentValue = currentParams[input.key] ?? input.defaultValue;
              
              // Determine if this should be a multiline input
              const isMultiline = input.key === 'code' || 
                                  input.key === 'query' || 
                                  input.key === 'importStatement' ||
                                  currentValue.length > 50;
              
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
                    helperText={isReadOnly ? "Start/End nodes cannot be edited" : `Default: ${input.defaultValue}`}
                    disabled={isReadOnly}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: isMultiline ? 'monospace' : 'inherit',
                        fontSize: isMultiline ? '0.875rem' : 'inherit',
                      },
                    }}
                  />
                </PropertyRow>
              );
            })}
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
