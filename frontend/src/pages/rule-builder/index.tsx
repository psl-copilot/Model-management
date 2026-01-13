import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Node, Edge } from '@xyflow/react';
import LeftSidebar from '../../components/RuleBuilder/LeftSidebar';
import Header from '../../components/RuleBuilder/Header';
import RuleBuilderCanvas from '../../components/RuleBuilder/Canvas';
import RightSidebar from '../../components/RuleBuilder/RightSidebar';
import NestedCanvas from '../../components/RuleBuilder/NestedCanvas';
import OutputModal from '../../components/RuleBuilder/OutputModal';
import { ValidationProvider } from '../../validation/context';
import { ValidationErrorModal } from '../../components/RuleBuilder/ValidationErrorModal';
import { useGetFlowQuery, useSaveFlowMutation } from '../../redux/Api/Rule-builder';
import { transformApiFlowData, type ApiNode, type ApiEdge } from '../../utils/Flow/FlowTransformers';
import {
  useFlowAnimation,
  useFlowState,
  useNestedCanvasManager,
} from '../../hooks/RuleBuilder';

interface RuleBuilderProps {
  viewOnly?: boolean;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ viewOnly = false }) => {
  const { id: ruleId } = useParams<{ id: string }>();
  const { data: flowData, isLoading: isLoadingFlow } = useGetFlowQuery(ruleId || '', {
    skip: !ruleId,
  });
  
  const [saveFlow, { isLoading: isSaving }] = useSaveFlowMutation();
  
  const flowState = useFlowState();
  const nestedCanvasManager = useNestedCanvasManager();
  
  const transformedFlowData = useMemo(() => {
    if (!flowData?.flow) return null;
    
    return transformApiFlowData(
      flowData.flow.nodes as ApiNode[] || [],
      flowData.flow.edges as ApiEdge[] || []
    );
  }, [flowData]);

  useEffect(() => {
    if (transformedFlowData?.nestedFlows) {
      Object.entries(transformedFlowData.nestedFlows).forEach(([nodeId, nestedFlow]) => {
        nestedCanvasManager.setNestedCanvasData(prev => ({
          ...prev,
          [nodeId]: nestedFlow,
        }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedFlowData]);

  const [showErrorModal, setShowErrorModal] = React.useState(false);

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
  
  const handleSetIsPlaying = (playing: boolean) => {
    if (!playing) {
      flowState.setDebugLogs([]);
      flowState.setDebugVariables({});
    }
  };
  
  const {
    playFlowAnimation,
    stopAnimation,
    updateFlowState,
    animationTimeoutRef,
  } = useFlowAnimation({
    isPlaying: Boolean(flowState.currentAnimationNode),
    setIsPlaying: handleSetIsPlaying,
    nestedCanvasData: nestedCanvasManager.nestedCanvasData,
    setDebugVariables: flowState.setDebugVariables,
    setDebugLogs: flowState.setDebugLogs,
    setCurrentAnimationNode: flowState.setCurrentAnimationNode,
  });

  const nodeUpdateHandlerRef = useRef<((nodeId: string, updates: Record<string, unknown>) => void) | null>(null);

  const handlePlayClick = () => {
    if (nestedCanvasManager.activeNestedCanvas) {
      nestedCanvasManager.setActiveNestedCanvas(null);
      flowState.setSelectedNode(null);
      setTimeout(playFlowAnimation, 100);
    } else {
      playFlowAnimation();
    }
  };

  const handleStopClick = () => {
    stopAnimation();
  };

  const handleDisplayJson = () => {
    window.generateFlowJson?.();
  };

  const handleGenerateCode = () => {
    window.generateFlowCode?.();
  };

  const handleSave = async () => {
    if (!ruleId) {
      toast.error('Rule ID not found');
      return;
    }

    try {
      const flowJson = window.generateFlowJson?.();
      if (!flowJson) {
        toast.error('Failed to generate flow data');
        return;
      }

      const response = await saveFlow({
        ruleId,
        flowData: JSON.parse(flowJson),
      }).unwrap();

      toast.success(response.message || 'Flow saved successfully');
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to save flow';
      toast.error(errorMessage);
    }
  };

  const handleNodeSelect = useCallback((node: Node | null) => {
    if (node?.data.nodeType === 'HandleTransaction') {
      nestedCanvasManager.openNestedCanvas(node.id, String(node.data.label || 'Handle Transaction'));
      flowState.setSelectedNode(null);
    } else {
      flowState.setSelectedNode(node);
      nestedCanvasManager.setActiveNestedCanvas(null);
    }
  }, [nestedCanvasManager, flowState]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Record<string, unknown>) => {
    if (nodeId === '_handler') {
      nodeUpdateHandlerRef.current = updates as unknown as (nodeId: string, updates: Record<string, unknown>) => void;
      return;
    }
    
    nodeUpdateHandlerRef.current?.(nodeId, updates);
  }, []);

  const handleFlowStateUpdate = ((
    nodes: Node[], 
    edges: Edge[], 
    setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void, 
    setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void
  ) => {
    updateFlowState(nodes, edges, setNodes, setEdges);
    flowState.setAllNodes(nodes);
    flowState.setEdges(edges);
  });
  
  const handleNestedCanvasSave = ((nodes: Node[], edges: Edge[]) => {
    if (nestedCanvasManager.activeNestedCanvas) {
      nestedCanvasManager.handleNestedCanvasSave(nestedCanvasManager.activeNestedCanvas, nodes, edges);
    }
  });

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
        onSave={handleSave}
        isSaving={isSaving}
        viewOnly={viewOnly}
      />
      {isLoadingFlow ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Typography>Loading flow...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!viewOnly && (
          <LeftSidebar 
            mode="main" 
            collapsed={flowState.sidebarCollapsed}
            onToggleCollapse={flowState.handleToggleSidebar}
            hideCustomFunctions={nestedCanvasManager.activeNestedCanvas !== null}
            allNodes={flowState.allNodes}
            edges={flowState.edges}
            selectedNodeId={flowState.selectedNode?.id || null}
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
          initialNodes={transformedFlowData?.nodes}
          initialEdges={transformedFlowData?.edges}
        />
        <RightSidebar
          key={flowState.selectedNode?.id || 'no-selection'}
          selectedNode={flowState.selectedNode}
          onClose={flowState.handleCloseRightSidebar}
          onUpdateNode={handleNodeUpdate}
          allNodes={flowState.allNodes}
          viewOnly={viewOnly}
        />

        {nestedCanvasManager.activeNestedCanvas && (
          <NestedCanvas
            nodeId={nestedCanvasManager.activeNestedCanvas}
            nodeLabel={nestedCanvasManager.activeNestedCanvasLabel}
            initialNodes={nestedCanvasManager.nestedCanvasData[nestedCanvasManager.activeNestedCanvas]?.nodes}
            initialEdges={nestedCanvasManager.nestedCanvasData[nestedCanvasManager.activeNestedCanvas]?.edges}
            onBack={nestedCanvasManager.handleNestedCanvasBack}
            onSave={handleNestedCanvasSave}
            viewOnly={viewOnly}
          />
        )}
      </Box>
      )}

      <OutputModal
        open={flowState.jsonModalOpen}
        onClose={() => flowState.setJsonModalOpen(false)}
        title="JSON Output"
        content={flowState.jsonOutput}
        emptyMessage="Click 'Display JSON' to see output"
        language="json"
      />

      <OutputModal
        open={flowState.codeModalOpen}
        onClose={() => flowState.setCodeModalOpen(false)}
        title="Generated TypeScript Code"
        content={flowState.codeOutput}
        emptyMessage="Click 'Generate Code' to see output"
        onDownload={() => flowState.handleDownload(flowState.generatedCode)}
        language="typescript"
      />

      <ValidationErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </Box>
  );
};

const RuleBuilderWithValidation: React.FC<RuleBuilderProps> = (props) => {
  return (
    <ValidationProvider>
      <RuleBuilder {...props} />
    </ValidationProvider>
  );
};

export default RuleBuilderWithValidation;