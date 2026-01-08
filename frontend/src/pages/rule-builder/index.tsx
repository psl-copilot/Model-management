import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Box } from '@mui/material';
import type { Node, Edge } from '@xyflow/react';
import LeftSidebar from '../../components/RuleBuilder/LeftSidebar';
import Header from '../../components/RuleBuilder/Header';
import RuleBuilderCanvas from '../../components/RuleBuilder/Canvas';
import RightSidebar from '../../components/RuleBuilder/RightSidebar';
import NestedCanvas from '../../components/RuleBuilder/NestedCanvas';
import OutputModal from '../../components/RuleBuilder/OutputModal';
import { ValidationProvider } from '../../validation/context';
import { ValidationErrorModal } from '../../components/RuleBuilder/ValidationErrorModal';
import {
  useFlowAnimation,
  useFlowState,
  useNestedCanvasManager,
} from '../../hooks/RuleBuilder';

interface RuleBuilderProps {
  viewOnly?: boolean;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ viewOnly = false }) => {
  // Custom hooks for state and animation management
  const flowState = useFlowState();
  const nestedCanvasManager = useNestedCanvasManager();
  
  // Validation state
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Animation hook
  const {
    playFlowAnimation,
    stopAnimation,
    updateFlowState,
    animationTimeoutRef,
  } = useFlowAnimation({
    isPlaying: flowState.debugVariables ? true : false,
    setIsPlaying: (playing) => {
      if (!playing) {
        flowState.setDebugLogs([]);
        flowState.setDebugVariables({});
      }
    },
    nestedCanvasData: nestedCanvasManager.nestedCanvasData,
    setDebugVariables: flowState.setDebugVariables,
    setDebugLogs: flowState.setDebugLogs,
    setCurrentAnimationNode: flowState.setCurrentAnimationNode,
  });

  // Use ref to store the node update handler from Canvas
  const nodeUpdateHandlerRef = useRef<((nodeId: string, updates: Record<string, unknown>) => void) | null>(null);

  const handlePlayClick = () => {
    if (nestedCanvasManager.activeNestedCanvas) {
      nestedCanvasManager.setActiveNestedCanvas(null);
      flowState.setSelectedNode(null);
      setTimeout(() => {
        playFlowAnimation();
      }, 100);
    } else {
      playFlowAnimation();
    }
  };

  const handleStopClick = () => {
    stopAnimation();
  };

  const handleDisplayJson = () => {
    if (window.generateFlowJson) {
      window.generateFlowJson();
    }
  };

  const handleGenerateCode = () => {
    if (window.generateFlowCode) {
      window.generateFlowCode();
    }
  };

  const handleNodeSelect = (node: Node | null) => {
    if (node) {
      if (node.data.nodeType === 'HandleTransaction') {
        nestedCanvasManager.openNestedCanvas(node.id, String(node.data.label || 'Handle Transaction'));
        flowState.setSelectedNode(null);
      } else {
        flowState.setSelectedNode(node);
        nestedCanvasManager.setActiveNestedCanvas(null);
      }
    }
  };

  const handleNodeUpdate = (nodeId: string, updates: Record<string, unknown>) => {
    if (nodeId === '_handler') {
      nodeUpdateHandlerRef.current = updates as unknown as (nodeId: string, updates: Record<string, unknown>) => void;
      return;
    }
    
    if (nodeUpdateHandlerRef.current) {
      nodeUpdateHandlerRef.current(nodeId, updates);
    }
  };

  const handleFlowStateUpdate = useCallback((
    nodes: Node[], 
    edges: Edge[], 
    setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void, 
    setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void
  ) => {
    updateFlowState(nodes, edges, setNodes, setEdges);
  }, [updateFlowState]);

  // Cleanup on unmount
  useEffect(() => {
    const timeoutRef = animationTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [animationTimeoutRef]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        isPlaying={Boolean(flowState.currentAnimationNode)}
        onPlayClick={handlePlayClick}
        onStopClick={handleStopClick}
        onDisplayJson={handleDisplayJson}
        onGenerateCode={handleGenerateCode}
        onViewErrors={() => setShowErrorModal(true)}
        viewOnly={viewOnly}
      />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!viewOnly && (
          <LeftSidebar 
            mode="main" 
            collapsed={flowState.sidebarCollapsed}
            onToggleCollapse={flowState.handleToggleSidebar}
            hideCustomFunctions={nestedCanvasManager.activeNestedCanvas !== null}
            allNodes={flowState.allNodes}
          />
        )}
        <RuleBuilderCanvas
          isPlaying={Boolean(flowState.currentAnimationNode)}
          onJsonGenerate={flowState.handleJsonGenerate}
          onCodeGenerate={flowState.handleCodeGenerate}
          onNodeSelect={handleNodeSelect}
          onNodeUpdate={handleNodeUpdate}
          debugVariables={flowState.debugVariables}
          debugLogs={flowState.debugLogs}
          currentNodeId={flowState.currentAnimationNode}
          nestedCanvasData={nestedCanvasManager.nestedCanvasData}
          viewOnly={viewOnly}
          onFlowStateUpdate={handleFlowStateUpdate}
        />
        <RightSidebar
          key={flowState.selectedNode?.id || 'no-selection'}
          selectedNode={flowState.selectedNode}
          onClose={flowState.handleCloseRightSidebar}
          onUpdateNode={handleNodeUpdate}
          allNodes={flowState.allNodes}
          viewOnly={viewOnly}
        />

        {/* Nested Canvas Overlay */}
        {nestedCanvasManager.activeNestedCanvas && (
          <NestedCanvas
            nodeId={nestedCanvasManager.activeNestedCanvas}
            nodeLabel={nestedCanvasManager.activeNestedCanvasLabel}
            initialNodes={nestedCanvasManager.nestedCanvasData[nestedCanvasManager.activeNestedCanvas]?.nodes}
            initialEdges={nestedCanvasManager.nestedCanvasData[nestedCanvasManager.activeNestedCanvas]?.edges}
            onBack={nestedCanvasManager.handleNestedCanvasBack}
            onSave={(nodes, edges) => nestedCanvasManager.handleNestedCanvasSave(nestedCanvasManager.activeNestedCanvas!, nodes, edges)}
            viewOnly={viewOnly}
          />
        )}
      </Box>

      {/* JSON Output Modal */}
      <OutputModal
        open={flowState.jsonModalOpen}
        onClose={() => flowState.setJsonModalOpen(false)}
        title="JSON Output"
        content={flowState.jsonOutput}
        emptyMessage="Click 'Display JSON' to see output"
        language="json"
      />

      {/* TypeScript Code Modal */}
      <OutputModal
        open={flowState.codeModalOpen}
        onClose={() => flowState.setCodeModalOpen(false)}
        title="Generated TypeScript Code"
        content={flowState.codeOutput}
        emptyMessage="Click 'Generate Code' to see output"
        onDownload={() => flowState.handleDownload(flowState.generatedCode)}
        language="typescript"
      />

      {/* Validation Error Modal */}
      <ValidationErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </Box>
  );
};

// Wrap with ValidationProvider
const RuleBuilderWithValidation: React.FC<RuleBuilderProps> = (props) => {
  return (
    <ValidationProvider>
      <RuleBuilder {...props} />
    </ValidationProvider>
  );
};

export default RuleBuilderWithValidation;