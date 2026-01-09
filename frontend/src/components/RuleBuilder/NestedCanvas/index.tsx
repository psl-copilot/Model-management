import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  type ReactFlowInstance,
  type Connection,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Paper, Typography, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditableNode from '../EditableNode';
import LeftSidebar from '../LeftSidebar';
import RightSidebar from '../RightSidebar';
import { getNodeTemplate } from '../../../utils/Flow/nodeTemplateService';
import { generateNestedNodeId } from '../../../utils/Flow/FlowDefaults';
import { getLabelForHandle, getColorForHandle } from '../../../utils/Common/helpers';
import { useValidationContext } from '../../../validation/context';

const nodeTypes = {
  editableNode: EditableNode,
};

interface NestedCanvasProps {
  nodeId: string;
  nodeLabel: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onBack: () => void;
  onSave: (nodes: Node[], edges: Edge[]) => void;
  viewOnly?: boolean;
}

const NestedCanvas: React.FC<NestedCanvasProps> = ({
  nodeId,
  nodeLabel,
  initialNodes: providedInitialNodes,
  initialEdges: providedInitialEdges,
  onBack,
  onSave,
  viewOnly = false,
}) => {
  // Generate initial nodes and edges once using lazy initialization
  const [initialNodesEdges] = useState(() => {
    // Use provided nodes/edges if available, otherwise create defaults
    if (providedInitialNodes && providedInitialEdges) {
      return { nodes: providedInitialNodes, edges: providedInitialEdges };
    }

    const startNodeId = generateNestedNodeId();
    const endNodeId = generateNestedNodeId();

    const startTemplate = getNodeTemplate('Start');
    const endTemplate = getNodeTemplate('End');

    // Helper to get default params
    const getDefaultParams = (template: ReturnType<typeof getNodeTemplate>) => {
      const params: Record<string, string> = {};
      if (template?.inputs) {
        template.inputs.forEach((input) => {
          params[input.key] = input.defaultValue || '';
        });
      }
      return params;
    };

    const nodes: Node[] = [
      {
        id: startNodeId,
        type: 'editableNode',
        position: { x: 100, y: 50 },
        data: {
          label: startTemplate?.displayName || 'Start',
          nodeType: 'Start',
          params: getDefaultParams(startTemplate),
        },
      },
      {
        id: endNodeId,
        type: 'editableNode',
        position: { x: 100, y: 300 },
        data: {
          label: endTemplate?.displayName || 'End',
          nodeType: 'End',
          params: getDefaultParams(endTemplate),
        },
      },
    ];

    return { nodes, edges: [] };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesEdges.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { clearNodeErrors } = useValidationContext();

  useEffect(() => {
    if (nodes.length > 0) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  // Node operations (inline implementation)
  const updateNode = useCallback(
    (nodeId: string, updates: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    },
    [setNodes]
  );

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);

    const deletableNodes = selectedNodes.filter(
      (node) =>
        String(node.data.nodeType) !== 'Start' &&
        String(node.data.nodeType) !== 'End'
    );

    if (deletableNodes.length > 0) {
      const deletableIds = new Set(deletableNodes.map((n) => n.id));

      if (selectedNode && deletableIds.has(selectedNode.id)) {
        setSelectedNode(null);
      }

      deletableIds.forEach((nodeId) => {
        clearNodeErrors(nodeId);
      });

      setNodes((currentNodes) =>
        currentNodes.filter((node) => !deletableIds.has(node.id))
      );

      setEdges((currentEdges) =>
        currentEdges.filter(
          (edge) => !deletableIds.has(edge.source) && !deletableIds.has(edge.target)
        )
      );
    }
  }, [nodes, setNodes, setEdges, clearNodeErrors, selectedNode]);

  const deleteSelectedEdges = useCallback(() => {
    setEdges((currentEdges) => currentEdges.filter((edge) => !edge.selected));
  }, [setEdges]);

  // Edge operations (inline implementation)
  const onConnect = useCallback(
    (params: Connection) => {
      // Find the source node to check if it's an If node
      const sourceNode = nodes.find((n) => n.id === params.source);
      const isIfNode = sourceNode?.data.nodeType === 'If';

      setEdges((eds) => {
        if (!isIfNode) {
          // For non-If nodes, check if source already has an outgoing edge
          const sourceHasEdge = eds.some((edge) => edge.source === params.source);

          if (sourceHasEdge) {
            console.warn('Each node can only have one outgoing connection');
            return eds;
          }
        } else {
          // For If nodes, check if this specific handle already has an edge
          const handleHasEdge = eds.some(
            (edge) =>
              edge.source === params.source && edge.sourceHandle === params.sourceHandle
          );

          if (handleHasEdge) {
            console.warn('This condition already has a connection');
            return eds;
          }
        }

        // Add label and style for If node edges
        const edgeWithLabel = {
          ...params,
          label:
            isIfNode && params.sourceHandle
              ? getLabelForHandle(params.sourceHandle)
              : undefined,
          style:
            isIfNode && params.sourceHandle
              ? {
                  stroke: getColorForHandle(params.sourceHandle),
                  strokeWidth: 2,
                }
              : undefined,
        };

        return addEdge(edgeWithLabel, eds);
      });
    },
    [nodes, setEdges]
  );

  // Keyboard shortcuts (inline implementation)
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Delete: Delete or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const target = event.target as HTMLElement;
        // Don't delete when typing in input fields
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        event.preventDefault();
        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedEdges.length > 0) {
          deleteSelectedEdges();
        } else {
          deleteSelectedNodes();
        }
      }

      // Select All: Ctrl+A
      if (event.ctrlKey && event.key === 'a') {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        event.preventDefault();
        setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
        setEdges((eds) => eds.map((edge) => ({ ...edge, selected: true })));
      }

      // Deselect All: Escape
      if (event.key === 'Escape') {
        setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
        setEdges((eds) => eds.map((edge) => ({ ...edge, selected: false })));
        setSelectedNode(null);
      }
    },
    [edges, setNodes, setEdges, deleteSelectedNodes, deleteSelectedEdges]
  );

  // Setup keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Drag and drop handlers
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create node with nested canvas ID
      const template = getNodeTemplate(type);
      const newNodeId = generateNestedNodeId();

      const defaultParams: Record<string, string> = {};
      if (template?.inputs) {
        template.inputs.forEach((input) => {
          defaultParams[input.key] = input.defaultValue || '';
        });
      }

      const newNode: Node = {
        id: newNodeId,
        type: 'editableNode',
        position,
        data: {
          label: template?.displayName || type,
          nodeType: type,
          params: defaultParams,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Node click handler - Open sidebar for editable nodes
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Don't open sidebar for Start and End nodes
      if (node.data.nodeType === 'Start' || node.data.nodeType === 'End') {
        setSelectedNode(null);
        return;
      }
      setSelectedNode(node);
    },
    []
  );

  // Pane click handler - Close sidebar when clicking empty space
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Close right sidebar handler
  const handleCloseRightSidebar = () => {
    setSelectedNode(null);
  };

  // Handle node updates from RightSidebar
  const handleNodeUpdate = (nodeId: string, updates: Record<string, unknown>) => {
    updateNode(nodeId, updates);
  };

  // Handle back button - save state before returning
  const handleBack = () => {
    onSave(nodes, edges);
    onBack();
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'background.paper',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={handleBack} color="primary" size="large">
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={600}>
            {nodeLabel} - Internal Flow
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Define the internal logic for this function
          </Typography>
        </Box>
        <Button variant="outlined" onClick={handleBack}>
          Back to Main Canvas
        </Button>
      </Paper>

      {/* Main Content with Sidebar and Canvas */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar with Global Variables */}
        {!viewOnly && <LeftSidebar mode="main" hideCustomFunctions={false} showGlobalVariables={true} allNodes={nodes} />}

        {/* Canvas */}
        <Box ref={reactFlowWrapper} sx={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={viewOnly ? undefined : onNodesChange}
            onEdgesChange={viewOnly ? undefined : onEdgesChange}
            onConnect={viewOnly ? undefined : onConnect}
            onInit={setReactFlowInstance}
            onDrop={viewOnly ? undefined : onDrop}
            onDragOver={viewOnly ? undefined : onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 150, y: 50, zoom: 1 }}
            nodesDraggable={!viewOnly}
            nodesConnectable={!viewOnly}
            elementsSelectable={!viewOnly}
            deleteKeyCode={null}
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-right">
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Nested Canvas: {nodeId}
                </Typography>
              </Paper>
            </Panel>
          </ReactFlow>
        </Box>

        {/* Right Sidebar */}
        <RightSidebar
          key={selectedNode?.id || 'no-selection'}
          selectedNode={selectedNode}
          onClose={handleCloseRightSidebar}
          onUpdateNode={handleNodeUpdate}
          allNodes={nodes}
          viewOnly={viewOnly}
        />
      </Box>
    </Box>
  );
};

export default NestedCanvas;
