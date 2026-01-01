import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  type ReactFlowInstance,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Paper, Typography, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditableNode, { type EditableNodeData } from '../EditableNode';
import LeftSidebar from '../LeftSidebar';
import RightSidebar from '../RightSidebar';
import { getNodeTemplate, type BaseNodeTemplate, type NodeInput } from '../../../utils/Templates/customFuncTemplate';
import { getLabelForHandle, getColorForHandle } from '../../../utils/Common/helpers';
import { generateNestedNodeId } from '../../../utils/Flow/FlowDefaults';

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
  // Helper function to get default params from template
  const getDefaultParams = (template: BaseNodeTemplate | null | undefined) => {
    const params: Record<string, string> = {};
    if (template?.inputs) {
      template.inputs.forEach((input: NodeInput) => {
        params[input.key] = input.defaultValue || '';
      });
    }
    return params;
  };

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

    const nodes: Node[] = [
      {
        id: startNodeId,
        type: 'editableNode',
        position: { x: 100, y: 50 },
        data: {
          label: startTemplate?.displayName || 'Start',
          nodeType: 'Start',
          params: getDefaultParams(startTemplate),
        } as EditableNodeData,
      },
      {
        id: endNodeId,
        type: 'editableNode',
        position: { x: 100, y: 300 },
        data: {
          label: endTemplate?.displayName || 'End',
          nodeType: 'End',
          params: getDefaultParams(endTemplate),
        } as EditableNodeData,
      },
    ];

    // No initial edges - nodes are NOT connected
    const edges: Edge[] = [];

    return { nodes, edges };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesEdges.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Auto-save: whenever nodes or edges change, save to parent
  useEffect(() => {
    // Skip initial render to avoid overwriting with default values
    if (nodes.length > 0) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  // Connection handler
  const onConnect = useCallback(
    (connection: Connection) => {
      // Find the source node to check if it's an If node
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const isIfNode = sourceNode?.data.nodeType === 'If';
      
      if (!isIfNode) {
        // For non-If nodes, check if source already has an outgoing edge
        const sourceHasEdge = edges.some((edge) => edge.source === connection.source);
        
        if (sourceHasEdge) {
          console.warn('Each node can only have one outgoing connection');
          return;
        }
      } else {
        // For If nodes, check if this specific handle already has an edge
        const handleHasEdge = edges.some(
          (edge) => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle
        );
        
        if (handleHasEdge) {
          console.warn('This condition already has a connection');
          return;
        }
      }
      
      // Add label and style for If node edge
      const edgeWithLabel = {
        ...connection,
        label: isIfNode && connection.sourceHandle ? getLabelForHandle(connection.sourceHandle) : undefined,
        style: isIfNode && connection.sourceHandle ? { 
          stroke: getColorForHandle(connection.sourceHandle),
          strokeWidth: 2,
        } : undefined,
      };
      
      setEdges((eds) => addEdge(edgeWithLabel, eds));
    },
    [nodes, edges, setEdges]
  );

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

      const template = getNodeTemplate(type);
      const newNodeId = generateNestedNodeId();

      // Initialize params with default values from template
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
        } as EditableNodeData,
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
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      })
    );
  };

  // Keyboard shortcuts - Protect Start and End nodes from deletion
  const onKeyDown = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Check if any input/textarea is focused - don't delete if user is typing
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return; // Don't delete when typing in input fields
        }

        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        // Check if any protected nodes are selected
        const hasProtectedNodes = selectedNodes.some(
          (node) => node.data.nodeType === 'Start' || node.data.nodeType === 'End'
        );

        // Filter out protected nodes (Start, End) from deletion
        const deletableNodes = selectedNodes.filter(
          (node) => node.data.nodeType !== 'Start' && node.data.nodeType !== 'End'
        );

        // Only proceed if there are nodes/edges to delete
        if (deletableNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault(); // Prevent browser back navigation
          
          // Delete only non-protected nodes
          if (deletableNodes.length > 0) {
            const deletableIds = new Set(deletableNodes.map((n) => n.id));
            setNodes((nds) => nds.filter((node) => !deletableIds.has(node.id)));
          }
          
          // Delete selected edges
          if (selectedEdges.length > 0) {
            setEdges((eds) => eds.filter((edge) => !edge.selected));
          }
        } else if (hasProtectedNodes) {
          // Prevent default to stop browser navigation even if only protected nodes are selected
          event.preventDefault();
        }
      }
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Register keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

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
        {/* Left Sidebar - Basic Nodes Only */}
        {!viewOnly && <LeftSidebar mode="main" hideCustomFunctions={true} />}

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
