import React, { useCallback, useState, useMemo } from 'react';
import { Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { Node } from '@xyflow/react';
import {
  SidebarContainer,
  CloseButton,
  EmptyState,
} from './styles';
import { getNodeTemplate } from '../../../utils/Flow/nodeTemplateService';
import {
  NodeHeader,
  BasicPropertiesSection,
  FetchDBSection,
  IfConditionEditor,
  ParameterSection,
  ConnectionInfoSection,
  FunctionPropertiesSection,
  AdvancedSection,
} from './components';
import { useNodeValidation } from '../../../hooks/RuleBuilder/useNodeValidation';

interface RightSidebarProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Record<string, unknown>) => void;
  allNodes?: Node[];
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
  allNodes,
  viewOnly = false,
}) => {
  const collapsed = !selectedNode;

  // Local state for editing
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingParams, setEditingParams] = useState<Record<string, string> | null>(null);
  const inputRefs = React.useRef<Record<string, HTMLInputElement | HTMLTextAreaElement>>({});
  const updateTimeoutRef = React.useRef<number | null>(null);
  const validationTimeoutRef = React.useRef<number | null>(null);
  const currentParamsRef = React.useRef<Record<string, string>>({});

  const nodeData = selectedNode?.data as NodeData | undefined;
  const template = nodeData?.nodeType ? getNodeTemplate(nodeData.nodeType) || null : null;

  // Validation hook
  const { validate, getFieldError } = useNodeValidation(
    selectedNode?.id || '',
    nodeData?.nodeType || '',
    nodeData?.label || 'Unknown'
  );

  // Memoized current values
  const currentLabel = useMemo(
    () => editingLabel !== null ? editingLabel : (nodeData?.label || ''),
    [editingLabel, nodeData?.label]
  );

  const currentParams = useMemo(
    () => editingParams !== null ? editingParams : (nodeData?.params || {}),
    [editingParams, nodeData?.params]
  );
  
  // Keep ref in sync with currentParams
  React.useEffect(() => {
    currentParamsRef.current = currentParams;
  }, [currentParams]);

  // Reset on node change
  React.useEffect(() => {
    // Clear any pending updates and validations
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }
    setEditingLabel(null);
    setEditingParams(null);
    // Validate new node immediately
    if (selectedNode && nodeData?.nodeType && nodeData?.params) {
      validate(nodeData.params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id]);

  // Get If conditions
  const conditions: IfCondition[] = useMemo(() => {
    if (nodeData?.nodeType !== 'If') return [];
    try {
      const conditionsStr = currentParams['conditions'];
      return conditionsStr ? JSON.parse(conditionsStr) : [{ type: 'if', condition: 'x > 5' }];
    } catch {
      return [{ type: 'if', condition: 'x > 5' }];
    }
  }, [currentParams, nodeData?.nodeType]);

  // ===== HANDLERS =====
  const handleLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLabel = event.target.value;
      setEditingLabel(newLabel);
      if (selectedNode) {
        onUpdateNode(selectedNode.id, { label: newLabel });
      }
    },
    [selectedNode, onUpdateNode]
  );

  const handleLabelBlur = useCallback(() => {
    setEditingLabel(null);
  }, []);
  
  const handleParamBlur = useCallback(() => {
    // Immediately apply pending updates when field loses focus
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }
    if (selectedNode && editingParams) {
      onUpdateNode(selectedNode.id, { params: editingParams });
      // Validate immediately on blur
      validate(editingParams);
    }
  }, [selectedNode, editingParams, onUpdateNode, validate]);

  const handleParamChange = useCallback(
    (paramKey: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      const updatedParams = { ...currentParamsRef.current, [paramKey]: newValue };
      setEditingParams(updatedParams);
      
      // Debounce node updates - only update after 300ms of no typing
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounce validation - run after 500ms of no typing
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      
      if (selectedNode) {
        updateTimeoutRef.current = setTimeout(() => {
          onUpdateNode(selectedNode.id, { params: updatedParams });
        }, 300);
        
        validationTimeoutRef.current = setTimeout(() => {
          validate(updatedParams);
        }, 500);
      }
    },
    [selectedNode, onUpdateNode, validate]
  );

  const handleDrop = useCallback(
    (paramKey: string) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      let variablePath = event.dataTransfer.getData('variablePath');
      if (variablePath && selectedNode) {
        // Strip all {{ }} wrapping to avoid double wrapping (global replace)
        variablePath = variablePath.replace(/\{\{\s*/g, '').replace(/\s*\}\}/g, '').trim();
        
        const inputElement = inputRefs.current[paramKey];
        const currentValue = currentParamsRef.current[paramKey] ?? '';
        let newValue: string;

        if (inputElement) {
          const start = inputElement.selectionStart || 0;
          const end = inputElement.selectionEnd || 0;
          const textBefore = currentValue.substring(0, start);
          const textAfter = currentValue.substring(end);
          // Wrap variable with {{ }} for UI indication
          newValue = textBefore + `{{ ${variablePath} }}` + textAfter;
          setTimeout(() => {
            const newCursorPos = start + `{{ ${variablePath} }}`.length;
            inputElement.setSelectionRange(newCursorPos, newCursorPos);
            inputElement.focus();
          }, 0);
        } else {
          // Wrap variable with {{ }} for UI indication
          const wrappedVariable = `{{ ${variablePath} }}`;
          newValue = currentValue ? `${currentValue} ${wrappedVariable}` : wrappedVariable;
        }

        const updatedParams = { ...currentParamsRef.current, [paramKey]: newValue };
        setEditingParams(updatedParams);
        onUpdateNode(selectedNode.id, { params: updatedParams });
      }
    },
    [selectedNode, onUpdateNode]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // ===== IF CONDITION HANDLERS (Keep inline for proper state sync) =====
  const handleConditionChange = useCallback(
    (index: number, newCondition: string) => {
      const newConditions = [...conditions];
      newConditions[index].condition = newCondition;
      const updatedParams = { ...currentParamsRef.current, conditions: JSON.stringify(newConditions) };
      setEditingParams(updatedParams);
      
      // Debounce the update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounce validation
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      
      if (selectedNode) {
        updateTimeoutRef.current = setTimeout(() => {
          onUpdateNode(selectedNode.id, { params: updatedParams });
        }, 300);
        
        validationTimeoutRef.current = setTimeout(() => {
          validate(updatedParams);
        }, 500);
      }
    },
    [conditions, selectedNode, onUpdateNode, validate]
  );

  const handleAddElseIf = useCallback(() => {
    const newConditions = [...conditions];
    const hasElse = newConditions.some((c) => c.type === 'else');
    if (hasElse) {
      const elseIndex = newConditions.findIndex((c) => c.type === 'else');
      newConditions.splice(elseIndex, 0, { type: 'elseif', condition: 'y > 10' });
    } else {
      newConditions.push({ type: 'elseif', condition: 'y > 10' });
    }
    const updatedParams = { ...currentParamsRef.current, conditions: JSON.stringify(newConditions) };
    setEditingParams(updatedParams);
    
    // Debounce the update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Debounce validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    if (selectedNode) {
      updateTimeoutRef.current = setTimeout(() => {
        onUpdateNode(selectedNode.id, { params: updatedParams });
      }, 300);
      
      validationTimeoutRef.current = setTimeout(() => {
        validate(updatedParams);
      }, 500);
    }
  }, [conditions, selectedNode, onUpdateNode, validate]);

  const handleAddElse = useCallback(() => {
    const newConditions = [...conditions];
    const hasElse = newConditions.some((c) => c.type === 'else');
    if (!hasElse) {
      newConditions.push({ type: 'else' });
      const updatedParams = { ...currentParamsRef.current, conditions: JSON.stringify(newConditions) };
      setEditingParams(updatedParams);
      
      // Debounce the update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounce validation
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      
      if (selectedNode) {
        updateTimeoutRef.current = setTimeout(() => {
          onUpdateNode(selectedNode.id, { params: updatedParams });
        }, 300);
        
        validationTimeoutRef.current = setTimeout(() => {
          validate(updatedParams);
        }, 500);
      }
    }
  }, [conditions, selectedNode, onUpdateNode, validate]);

  const handleRemoveCondition = useCallback(
    (index: number) => {
      const newConditions = [...conditions];
      if (newConditions.length > 1) {
        newConditions.splice(index, 1);
        const updatedParams = { ...currentParamsRef.current, conditions: JSON.stringify(newConditions) };
        setEditingParams(updatedParams);
        
        // Debounce the update
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        // Debounce validation
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
        
        if (selectedNode) {
          updateTimeoutRef.current = setTimeout(() => {
            onUpdateNode(selectedNode.id, { params: updatedParams });
          }, 300);
          
          validationTimeoutRef.current = setTimeout(() => {
            validate(updatedParams);
          }, 500);
        }
      }
    },
    [conditions, selectedNode, onUpdateNode, validate]
  );

  // ===== RENDER =====
  if (collapsed) {
    return (
      <SidebarContainer collapsed={true}>
        <EmptyState>
          <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">Select a node to view properties</Typography>
        </EmptyState>
      </SidebarContainer>
    );
  }

  if (!selectedNode || !template) {
    return (
      <SidebarContainer collapsed={false}>
        <CloseButton size="small" onClick={onClose} aria-label="Close properties panel">
          <CloseIcon fontSize="small" />
        </CloseButton>
        <EmptyState>
          <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">Node not found</Typography>
        </EmptyState>
      </SidebarContainer>
    );
  }

  const isFunctionNode = template && 'description' in template;
  const isReadOnly = nodeData?.nodeType === 'Start' || nodeData?.nodeType === 'End';

  return (
    <SidebarContainer collapsed={false}>
      <CloseButton size="small" onClick={onClose} aria-label="Close properties panel">
        <CloseIcon fontSize="small" />
      </CloseButton>

      <NodeHeader
        templateDisplayName={template.displayName || template.label || 'Node'}
        isFunctionNode={isFunctionNode}
        description={isFunctionNode ? template.description : undefined}
      />

      <BasicPropertiesSection
        selectedNode={selectedNode}
        currentLabel={currentLabel}
        onLabelChange={handleLabelChange}
        onLabelBlur={handleLabelBlur}
        templateDisplayName={template.displayName || template.label || 'Node'}
        isReadOnly={isReadOnly}
        viewOnly={viewOnly}
      />

      {nodeData?.nodeType === 'FetchDB' && (
        <FetchDBSection
          currentParams={currentParams}
          onParamChange={handleParamChange}
          onParamBlur={handleParamBlur}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          inputRefs={inputRefs}
          isReadOnly={isReadOnly}
          viewOnly={viewOnly}
          allNodes={allNodes}
          getFieldError={getFieldError}
        />
      )}

      {nodeData?.nodeType === 'If' ? (
        <IfConditionEditor
          conditions={conditions}
          onConditionChange={handleConditionChange}
          onAddElseIf={handleAddElseIf}
          onAddElse={handleAddElse}
          onRemoveCondition={handleRemoveCondition}
          inputRefs={inputRefs}
          onDragOver={handleDragOver}
          viewOnly={viewOnly}
          allNodes={allNodes}
          getFieldError={getFieldError}
        />
      ) : (
        template.inputs &&
        template.inputs.length > 0 && (
          <ParameterSection
            inputs={template.inputs.map(input => ({
              ...input,
              defaultValue: input.defaultValue || ''
            }))}
            currentParams={currentParams}
            onParamChange={handleParamChange}
            onParamBlur={handleParamBlur}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            inputRefs={inputRefs}
            variableError={null}
            isReadOnly={isReadOnly}
            viewOnly={viewOnly}
            nodeType={nodeData?.nodeType}
            allNodes={allNodes}
            getFieldError={getFieldError}
          />
        )
      )}

      <ConnectionInfoSection 
        template={{
          displayName: template.displayName || template.label || 'Node',
          handles: template.handles || { source: true, target: true }
        }} 
      />

      {isFunctionNode && template.description && (
        <FunctionPropertiesSection 
          template={{
            description: template.description
          }} 
        />
      )}

      <AdvancedSection selectedNode={selectedNode} />
    </SidebarContainer>
  );
};

export default RightSidebar;
